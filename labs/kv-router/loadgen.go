// 自己写的最小实现，非 Kinference 实现。
// Closed-loop load generator: C clients, each sends its next request as soon
// as the previous stream ends. TTFT = request start -> first content chunk.
package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"math/rand/v2"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

type WorkloadConfig struct {
	Name         string    // shared | hot | multiturn
	Prefixes     int       // shared/hot: number of distinct system prompts
	PrefixTokens int       // shared/hot: tokens per system prompt
	UserTokens   int       // shared/hot: unique user tokens per request
	HotWeights   []float64 // hot: probability of prefix 0,1,...; rest uniform
	FirstTokens  int       // multiturn: unique first user message
	TurnTokens   int       // multiturn: new user tokens per turn
	Turns        int       // multiturn: turns per conversation
	OutTokens    int
}

type Sample struct {
	Start     time.Time
	TTFT      time.Duration
	Status    int
	Backend   int
	Prompt    int
	Cached    int
	Predicted int
	Reply     string
}

func words(r *rand.Rand, n int, tag string) string {
	var b strings.Builder
	for i := 0; i < n; i++ {
		fmt.Fprintf(&b, "%s%x ", tag, r.Uint32())
	}
	return b.String()
}

type Workload struct {
	cfg      WorkloadConfig
	prefixes []string
	cum      []float64
}

func NewWorkload(cfg WorkloadConfig, seed uint64) *Workload {
	w := &Workload{cfg: cfg}
	r := rand.New(rand.NewPCG(seed, 99))
	for i := 0; i < cfg.Prefixes; i++ {
		w.prefixes = append(w.prefixes, words(r, cfg.PrefixTokens, fmt.Sprintf("p%d_", i)))
	}
	// cumulative distribution over prefixes
	if cfg.Prefixes > 0 {
		p := make([]float64, cfg.Prefixes)
		rest := 1.0
		for i, hw := range cfg.HotWeights {
			p[i] = hw
			rest -= hw
		}
		k := cfg.Prefixes - len(cfg.HotWeights)
		for i := len(cfg.HotWeights); i < cfg.Prefixes; i++ {
			p[i] = rest / float64(k)
		}
		acc := 0.0
		for _, x := range p {
			acc += x
			w.cum = append(w.cum, acc)
		}
	}
	return w
}

func (w *Workload) pickPrefix(r *rand.Rand) int {
	u := r.Float64() * w.cum[len(w.cum)-1]
	for i, c := range w.cum {
		if u < c {
			return i
		}
	}
	return len(w.cum) - 1
}

// do sends one streaming request and returns the sample.
func do(c *http.Client, url string, msgs []Message, outTok int) Sample {
	body, _ := json.Marshal(ChatRequest{Model: "mock", Messages: msgs, MaxTokens: outTok, Stream: true})
	s := Sample{Start: time.Now(), Backend: -1}
	resp, err := c.Post(url+"/v1/chat/completions", "application/json", bytes.NewReader(body))
	if err != nil {
		s.Status = 599
		return s
	}
	defer resp.Body.Close()
	s.Status = resp.StatusCode
	s.Backend, _ = strconv.Atoi(resp.Header.Get("X-Router-Backend"))
	s.Predicted, _ = strconv.Atoi(resp.Header.Get("X-Router-Predicted-Cached"))
	if resp.StatusCode != 200 {
		return s
	}
	sc := bufio.NewScanner(resp.Body)
	sc.Buffer(make([]byte, 64*1024), 1<<20)
	var reply strings.Builder
	for sc.Scan() {
		line := sc.Text()
		if !strings.HasPrefix(line, "data: ") || line == "data: [DONE]" {
			continue
		}
		var ch struct {
			Choices []struct {
				Delta struct{ Content string } `json:"delta"`
			} `json:"choices"`
			Usage *struct {
				PromptTokens int `json:"prompt_tokens"`
				Details      struct {
					CachedTokens int `json:"cached_tokens"`
				} `json:"prompt_tokens_details"`
			} `json:"usage"`
		}
		if json.Unmarshal([]byte(line[6:]), &ch) != nil {
			continue
		}
		if len(ch.Choices) > 0 && ch.Choices[0].Delta.Content != "" {
			if s.TTFT == 0 {
				s.TTFT = time.Since(s.Start)
			}
			reply.WriteString(ch.Choices[0].Delta.Content)
		}
		if ch.Usage != nil {
			s.Prompt, s.Cached = ch.Usage.PromptTokens, ch.Usage.Details.CachedTokens
		}
	}
	s.Reply = reply.String()
	return s
}

// Run drives `conc` closed-loop clients until warm+measure elapses. Samples
// whose request STARTED inside [warm, warm+measure) are returned.
func (w *Workload) Run(url string, conc int, warm, measure time.Duration, seed uint64, onMeasureStart func()) []Sample {
	c := &http.Client{Transport: &http.Transport{MaxIdleConnsPerHost: 1024}}
	t0 := time.Now()
	mStart, mEnd := t0.Add(warm), t0.Add(warm+measure)
	var mu sync.Mutex
	var out []Sample
	var wg sync.WaitGroup
	go func() { time.Sleep(time.Until(mStart)); onMeasureStart() }()
	for ci := 0; ci < conc; ci++ {
		wg.Add(1)
		go func(ci int) {
			defer wg.Done()
			r := rand.New(rand.NewPCG(seed, uint64(ci)+1000))
			var conv []Message
			turn := 0
			for time.Now().Before(mEnd) {
				var msgs []Message
				switch w.cfg.Name {
				case "shared", "hot":
					k := w.pickPrefix(r)
					msgs = []Message{{"system", w.prefixes[k]}, {"user", words(r, w.cfg.UserTokens, "u")}}
				case "multiturn":
					if turn == 0 {
						conv = []Message{{"user", words(r, w.cfg.FirstTokens, "c")}}
					} else {
						conv = append(conv, Message{"user", words(r, w.cfg.TurnTokens, "u")})
					}
					msgs = conv
				}
				s := do(c, url, msgs, w.cfg.OutTokens)
				if w.cfg.Name == "multiturn" {
					if s.Status == 200 {
						conv = append(conv, Message{"assistant", s.Reply})
						turn++
					}
					if turn >= w.cfg.Turns || s.Status != 200 {
						turn = 0
					}
				}
				s.Reply = ""
				if !s.Start.Before(mStart) && s.Start.Before(mEnd) {
					mu.Lock()
					out = append(out, s)
					mu.Unlock()
				}
			}
		}(ci)
	}
	wg.Wait()
	return out
}

func randFor(seed uint64) *rand.Rand { return rand.New(rand.NewPCG(seed, 4242)) }
