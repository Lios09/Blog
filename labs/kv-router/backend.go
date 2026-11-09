// 自己写的最小实现，非 Kinference 实现，也不是 vLLM。
// A mock "vLLM" worker: OpenAI-style /v1/chat/completions with SSE streaming,
// an LRU prefix cache of block hashes, prefill time proportional to UNCACHED
// tokens, per-token decode time, bounded running slots and a bounded queue.
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

type BackendConfig struct {
	BlockSize       int     // tokens per KV block
	CacheBlocks     int     // LRU capacity in blocks
	PrefillBaseMs   float64 // fixed per-request prefill overhead
	PrefillUsPerTok float64 // prefill cost per uncached token (microseconds)
	DecodeMsPerTok  float64 // per output token after the first
	MaxRunning      int     // concurrent requests holding a "batch slot"
	MaxWaiting      int     // queue bound; beyond this the worker answers 429
}

// KVEvent mimics vLLM's KV-cache events (stored / removed block hashes).
type KVEvent struct {
	Stored, Removed []uint64
}

type Backend struct {
	ID   int
	cfg  BackendConfig
	slot chan struct{}
	// The GPU does one prefill at a time in this model; decode of other
	// requests continues in parallel (no batching interference modelled).
	prefillMu sync.Mutex
	cacheMu   sync.Mutex
	cache     *BlockLRU
	OnEvent   func(KVEvent) // optional subscriber (router "events" table mode)

	waiting atomic.Int64
	// stats
	statMu      sync.Mutex
	requests    int64
	rejected    int64
	peakWaiting int64
	areaWaiting float64 // integral of waiting-queue length over time (req*s)
	lastChange  time.Time
	start       time.Time
}

func NewBackend(id int, cfg BackendConfig) *Backend {
	now := time.Now()
	return &Backend{ID: id, cfg: cfg, slot: make(chan struct{}, cfg.MaxRunning),
		cache: NewBlockLRU(cfg.CacheBlocks), lastChange: now, start: now}
}

func (b *Backend) addWaiting(d int64) {
	b.statMu.Lock()
	now := time.Now()
	b.areaWaiting += float64(b.waiting.Load()) * now.Sub(b.lastChange).Seconds()
	b.lastChange = now
	w := b.waiting.Add(d)
	if w > b.peakWaiting {
		b.peakWaiting = w
	}
	b.statMu.Unlock()
}

type BackendStats struct {
	Requests, Rejected, PeakWaiting int64
	AvgWaiting                      float64
}

func (b *Backend) Stats() BackendStats {
	b.addWaiting(0)
	b.statMu.Lock()
	defer b.statMu.Unlock()
	el := time.Since(b.start).Seconds()
	return BackendStats{b.requests, b.rejected, b.peakWaiting, b.areaWaiting / el}
}

// ResetStats starts a fresh measurement window (cache contents are kept).
func (b *Backend) ResetStats() {
	b.statMu.Lock()
	now := time.Now()
	b.requests, b.rejected, b.peakWaiting, b.areaWaiting = 0, 0, b.waiting.Load(), 0
	b.lastChange, b.start = now, now
	b.statMu.Unlock()
}

type ChatRequest struct {
	Model     string    `json:"model"`
	Messages  []Message `json:"messages"`
	MaxTokens int       `json:"max_tokens"`
	Stream    bool      `json:"stream"`
}

func sleepMs(ms float64) { time.Sleep(time.Duration(ms * float64(time.Millisecond))) }

func (b *Backend) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/v1/chat/completions" {
		http.NotFound(w, r)
		return
	}
	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	if req.MaxTokens <= 0 {
		req.MaxTokens = 16
	}
	toks := Tokenize(Render(req.Messages, "engine"))
	hs := BlockHashes(toks, b.cfg.BlockSize)

	// Admission: bounded waiting queue, then a running slot.
	if b.waiting.Load() >= int64(b.cfg.MaxWaiting) {
		b.statMu.Lock()
		b.rejected++
		b.statMu.Unlock()
		http.Error(w, "queue full", http.StatusTooManyRequests)
		return
	}
	b.addWaiting(1)
	b.slot <- struct{}{}
	b.addWaiting(-1)
	defer func() { <-b.slot }()
	b.statMu.Lock()
	b.requests++
	b.statMu.Unlock()

	// Prefill: serial on this worker; cost ∝ uncached tokens.
	b.prefillMu.Lock()
	b.cacheMu.Lock()
	matched := b.cache.MatchPrefix(hs)
	b.cacheMu.Unlock()
	cached := matched * b.cfg.BlockSize
	uncached := len(toks) - cached
	sleepMs(b.cfg.PrefillBaseMs + float64(uncached)*b.cfg.PrefillUsPerTok/1000)
	b.cacheMu.Lock()
	evicted := b.cache.Insert(hs)
	b.cacheMu.Unlock()
	b.prefillMu.Unlock()
	if b.OnEvent != nil {
		b.OnEvent(KVEvent{Stored: hs, Removed: evicted})
	}

	if !req.Stream {
		http.Error(w, "only stream=true is implemented", 400)
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	fl, _ := w.(http.Flusher)
	id := fmt.Sprintf("chatcmpl-b%d", b.ID)
	send := func(v any) {
		bs, _ := json.Marshal(v)
		fmt.Fprintf(w, "data: %s\n\n", bs)
		if fl != nil {
			fl.Flush()
		}
	}
	chunk := func(content string) map[string]any {
		return map[string]any{"id": id, "object": "chat.completion.chunk", "model": req.Model,
			"choices": []any{map[string]any{"index": 0, "delta": map[string]any{"content": content}}}}
	}
	for i := 0; i < req.MaxTokens; i++ {
		if i > 0 {
			sleepMs(b.cfg.DecodeMsPerTok)
		}
		t := fmt.Sprintf("r%dt%d", b.ID, i)
		send(chunk(t + " "))
	}
	send(map[string]any{"id": id, "object": "chat.completion.chunk", "model": req.Model, "choices": []any{},
		"usage": map[string]any{"prompt_tokens": len(toks), "completion_tokens": req.MaxTokens,
			"prompt_tokens_details": map[string]any{"cached_tokens": cached}}})
	fmt.Fprint(w, "data: [DONE]\n\n")
	if fl != nil {
		fl.Flush()
	}
}
