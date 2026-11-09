// 自己写的最小实现，非 Kinference 实现。
// A KV-cache-aware reverse proxy for OpenAI-compatible streaming chat.
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math/rand/v2"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type RouterConfig struct {
	Policy         string  // rr | least | prefix | kv
	BlockSize      int     // must equal the workers' block size
	TableBlocks    int     // capacity of the router's per-worker shadow table
	PrefillMsTok   float64 // score: ms per uncached token
	QueueCostMs    float64 // score: ms per in-flight request on the worker
	TableMode      string  // shadow (credit on dispatch) | events (only KV events)
	EventDelay     time.Duration
	Template       string // engine | mismatch (router renders differently)
	TieToleranceMs float64
}

type Router struct {
	cfg      RouterConfig
	targets  []string
	client   *http.Client
	mu       sync.Mutex
	tables   []*BlockLRU           // shadow mode
	sets     []map[uint64]struct{} // events mode
	inflight []int
	rr       int
	rng      *rand.Rand
}

func NewRouter(cfg RouterConfig, targets []string) *Router {
	r := &Router{cfg: cfg, targets: targets, inflight: make([]int, len(targets)),
		rng:    rand.New(rand.NewPCG(1, 2)),
		client: &http.Client{Transport: &http.Transport{MaxIdleConnsPerHost: 512, MaxConnsPerHost: 0}}}
	for range targets {
		r.tables = append(r.tables, NewBlockLRU(cfg.TableBlocks))
		r.sets = append(r.sets, map[uint64]struct{}{})
	}
	return r
}

// Subscribe returns the KV-event handler for worker i (events mode).
func (r *Router) Subscribe(i int) func(KVEvent) {
	return func(ev KVEvent) {
		apply := func() {
			r.mu.Lock()
			for _, h := range ev.Removed {
				delete(r.sets[i], h)
			}
			for _, h := range ev.Stored {
				r.sets[i][h] = struct{}{}
			}
			r.mu.Unlock()
		}
		if r.cfg.EventDelay > 0 {
			time.AfterFunc(r.cfg.EventDelay, apply)
		} else {
			apply()
		}
	}
}

func (r *Router) matched(i int, hs []uint64) int {
	if r.cfg.TableMode == "events" {
		n := 0
		for _, h := range hs {
			if _, ok := r.sets[i][h]; !ok {
				break
			}
			n++
		}
		return n
	}
	return r.tables[i].MatchPrefix(hs)
}

// pick returns the chosen worker and the predicted cached tokens there.
// Must hold r.mu. Ties are broken by fewer in-flight, then uniformly random.
func (r *Router) pick(nTok int, hs []uint64) (int, int) {
	n := len(r.targets)
	match := make([]int, n)
	for i := range n {
		match[i] = r.matched(i, hs)
	}
	switch r.cfg.Policy {
	case "rr":
		i := r.rr % n
		r.rr++
		return i, match[i] * r.cfg.BlockSize
	case "least":
		return r.argmin(func(i int) float64 { return float64(r.inflight[i]) }, 0), 0
	case "prefix": // longest cached prefix wins; load is ignored entirely
		i := r.argmin(func(i int) float64 { return -float64(match[i]) }, 0)
		return i, match[i] * r.cfg.BlockSize
	case "kv":
		i := r.argmin(func(i int) float64 {
			uncached := nTok - match[i]*r.cfg.BlockSize
			return float64(uncached)*r.cfg.PrefillMsTok + float64(r.inflight[i])*r.cfg.QueueCostMs
		}, r.cfg.TieToleranceMs)
		return i, match[i] * r.cfg.BlockSize
	}
	panic("unknown policy " + r.cfg.Policy)
}

func (r *Router) argmin(score func(int) float64, tol float64) int {
	best := score(0)
	for i := 1; i < len(r.targets); i++ {
		best = min(best, score(i))
	}
	var cand []int
	minInf := int(^uint(0) >> 1)
	for i := range r.targets {
		if score(i) <= best+tol {
			if r.inflight[i] < minInf {
				minInf, cand = r.inflight[i], cand[:0]
			}
			if r.inflight[i] == minInf {
				cand = append(cand, i)
			}
		}
	}
	return cand[r.rng.IntN(len(cand))]
}

func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	body, err := io.ReadAll(req.Body)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	var cr ChatRequest
	if err := json.Unmarshal(body, &cr); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	toks := Tokenize(Render(cr.Messages, r.cfg.Template))
	hs := BlockHashes(toks, r.cfg.BlockSize)

	r.mu.Lock()
	i, predicted := r.pick(len(toks), hs)
	r.inflight[i]++
	if r.cfg.TableMode != "events" {
		r.tables[i].Insert(hs) // optimistic credit: assume it will be cached there
	}
	r.mu.Unlock()
	defer func() { r.mu.Lock(); r.inflight[i]--; r.mu.Unlock() }()

	up, err := http.NewRequest("POST", r.targets[i]+"/v1/chat/completions", bytes.NewReader(body))
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	up.Header.Set("Content-Type", "application/json")
	resp, err := r.client.Do(up)
	if err != nil {
		http.Error(w, err.Error(), 502)
		return
	}
	defer resp.Body.Close()
	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	w.Header().Set("X-Router-Backend", strconv.Itoa(i))
	w.Header().Set("X-Router-Predicted-Cached", strconv.Itoa(predicted))
	w.WriteHeader(resp.StatusCode)
	fl, _ := w.(http.Flusher)
	buf := make([]byte, 4096)
	for {
		n, err := resp.Body.Read(buf)
		if n > 0 {
			w.Write(buf[:n])
			if fl != nil {
				fl.Flush()
			}
		}
		if err != nil {
			if err != io.EOF {
				fmt.Println("proxy read:", err)
			}
			return
		}
	}
}
