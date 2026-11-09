// 自己写的最小实现，非 Kinference 实现。
package main

import (
	"encoding/csv"
	"flag"
	"fmt"
	"net"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
)

var (
	backendsFlag = flag.String("backends", "2,4", "backend counts")
	policiesFlag = flag.String("policies", "rr,least,prefix,kv", "policies")
	worksFlag    = flag.String("workloads", "shared,multiturn,hot", "workloads")
	connPer      = flag.Int("conc-per-backend", 8, "closed-loop clients per backend")
	warm         = flag.Duration("warm", 4*time.Second, "warmup")
	measure      = flag.Duration("measure", 15*time.Second, "measurement window")
	reps         = flag.Int("reps", 3, "repetitions")
	slo          = flag.Duration("slo", 100*time.Millisecond, "TTFT SLO")
	mode         = flag.String("mode", "main", "main | calibrate | pitfalls")
	outPrefix    = flag.String("out", "results", "output file prefix")
)

var bcfg = BackendConfig{BlockSize: 16, CacheBlocks: 2500, PrefillBaseMs: 2, PrefillUsPerTok: 25,
	DecodeMsPerTok: 1.5, MaxRunning: 4, MaxWaiting: 64}

var wcfgs = map[string]WorkloadConfig{
	"shared":    {Name: "shared", Prefixes: 32, PrefixTokens: 2000, UserTokens: 64, OutTokens: 32},
	"hot":       {Name: "hot", Prefixes: 32, PrefixTokens: 2000, UserTokens: 64, OutTokens: 32, HotWeights: []float64{0.6, 0.2}},
	"multiturn": {Name: "multiturn", FirstTokens: 1000, TurnTokens: 100, Turns: 8, OutTokens: 32},
}

func baseRouterCfg(policy string) RouterConfig {
	return RouterConfig{Policy: policy, BlockSize: bcfg.BlockSize, TableBlocks: bcfg.CacheBlocks,
		PrefillMsTok: bcfg.PrefillUsPerTok / 1000, QueueCostMs: 12.5, TableMode: "shadow",
		Template: "engine", TieToleranceMs: 0.5}
}

func serve(h http.Handler) (string, func()) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		panic(err)
	}
	srv := &http.Server{Handler: h}
	go srv.Serve(ln)
	return "http://" + ln.Addr().String(), func() { srv.Close() }
}

type Row struct {
	Exp, Work, Policy string
	B, Rep            int
	OK, Err           int
	RPS, Goodput      float64
	SLOPct            float64
	P50, P99          float64
	HitPct            float64
	OverPredPct       float64
	MaxShare          float64
	MaxAvgWait        float64
	MaxPeakWait       int64
	PerBackend        string
}

func pct(xs []float64, p float64) float64 {
	if len(xs) == 0 {
		return 0
	}
	s := append([]float64(nil), xs...)
	sort.Float64s(s)
	k := int(float64(len(s))*p+0.999999) - 1 // nearest rank
	return s[max(0, min(k, len(s)-1))]
}

func runOne(exp, work string, nb int, rcfg RouterConfig, rep int) Row {
	var urls []string
	var bks []*Backend
	var stops []func()
	r := NewRouter(rcfg, nil)
	for i := 0; i < nb; i++ {
		b := NewBackend(i, bcfg)
		u, stop := serve(b)
		urls, bks, stops = append(urls, u), append(bks, b), append(stops, stop)
	}
	r = NewRouter(rcfg, urls)
	if rcfg.TableMode == "events" {
		for i, b := range bks {
			b.OnEvent = r.Subscribe(i)
		}
	}
	ru, rstop := serve(r)
	defer func() {
		rstop()
		for _, s := range stops {
			s()
		}
	}()
	wl := NewWorkload(wcfgs[work], uint64(rep)*7919)
	samples := wl.Run(ru, *connPer*nb, *warm, *measure, uint64(rep), func() {
		for _, b := range bks {
			b.ResetStats()
		}
	})
	stats := make([]BackendStats, nb)
	for i, b := range bks {
		stats[i] = b.Stats()
	}
	row := Row{Exp: exp, Work: work, Policy: rcfg.Policy, B: nb, Rep: rep}
	var ttft []float64
	var prompt, cached, over, good int
	perB := make([][]float64, nb)
	for _, s := range samples {
		if s.Status != 200 {
			row.Err++
			continue
		}
		row.OK++
		ms := float64(s.TTFT) / 1e6
		ttft = append(ttft, ms)
		if s.Backend >= 0 && s.Backend < nb {
			perB[s.Backend] = append(perB[s.Backend], ms)
		}
		prompt += s.Prompt
		cached += s.Cached
		if s.Predicted > s.Cached {
			over++
		}
		if s.TTFT <= *slo {
			good++
		}
	}
	sec := measure.Seconds()
	row.RPS = float64(row.OK) / sec
	row.Goodput = float64(good) / sec
	if len(samples) > 0 {
		row.SLOPct = 100 * float64(good) / float64(len(samples))
	}
	row.P50, row.P99 = pct(ttft, .5), pct(ttft, .99)
	if prompt > 0 {
		row.HitPct = 100 * float64(cached) / float64(prompt)
	}
	if row.OK > 0 {
		row.OverPredPct = 100 * float64(over) / float64(row.OK)
	}
	var parts []string
	for i := 0; i < nb; i++ {
		share := 0.0
		if row.OK > 0 {
			share = 100 * float64(len(perB[i])) / float64(row.OK)
		}
		row.MaxShare = max(row.MaxShare, share)
		row.MaxAvgWait = max(row.MaxAvgWait, stats[i].AvgWaiting)
		row.MaxPeakWait = max(row.MaxPeakWait, stats[i].PeakWaiting)
		parts = append(parts, fmt.Sprintf("b%d:share=%.1f%%,avgq=%.2f,peakq=%d,p99=%.1f", i, share,
			stats[i].AvgWaiting, stats[i].PeakWaiting, pct(perB[i], .99)))
	}
	row.PerBackend = strings.Join(parts, " ")
	return row
}

func f(x float64) string { return strconv.FormatFloat(x, 'f', 2, 64) }

func writeRow(w *csv.Writer, r Row) {
	w.Write([]string{r.Exp, r.Work, r.Policy, strconv.Itoa(r.B), strconv.Itoa(r.Rep), strconv.Itoa(r.OK),
		strconv.Itoa(r.Err), f(r.RPS), f(r.Goodput), f(r.SLOPct), f(r.P50), f(r.P99), f(r.HitPct),
		f(r.OverPredPct), f(r.MaxShare), f(r.MaxAvgWait), strconv.FormatInt(r.MaxPeakWait, 10), r.PerBackend})
	w.Flush()
}

func calibrate() {
	// Idle single worker, sequential requests: uncached vs fully-warm prefix.
	b := NewBackend(0, bcfg)
	u, stop := serve(b)
	defer stop()
	r := NewRouter(baseRouterCfg("rr"), []string{u})
	ru, rstop := serve(r)
	defer rstop()
	wl := NewWorkload(wcfgs["shared"], 1)
	c := &http.Client{}
	var cold, warmT []float64
	var last Sample
	for i := 0; i < 20; i++ {
		// new random prefix each time => uncached
		msgs := []Message{{"system", words(randFor(uint64(i)), 2000, "z")}, {"user", words(randFor(uint64(i+100)), 64, "u")}}
		s := do(c, ru, msgs, 32)
		cold = append(cold, float64(s.TTFT)/1e6)
		msgs = []Message{{"system", wl.prefixes[0]}, {"user", words(randFor(uint64(i+200)), 64, "u")}}
		s = do(c, ru, msgs, 32)
		last = s
		if i > 0 {
			warmT = append(warmT, float64(s.TTFT)/1e6)
		}
	}
	fmt.Printf("idle uncached TTFT: p50=%.2fms p99=%.2fms n=%d\n", pct(cold, .5), pct(cold, .99), len(cold))
	fmt.Printf("idle warm-prefix TTFT (prompt=%d tokens, cached=%d): p50=%.2fms p99=%.2fms n=%d\n", last.Prompt, last.Cached, pct(warmT, .5), pct(warmT, .99), len(warmT))
}

func main() {
	flag.Parse()
	fmt.Fprintf(os.Stderr, "backend=%+v slo=%v conc/backend=%d warm=%v measure=%v reps=%d\n", bcfg, *slo, *connPer, *warm, *measure, *reps)
	if *mode == "calibrate" {
		calibrate()
		return
	}
	w := csv.NewWriter(os.Stdout)
	w.Write([]string{"exp", "workload", "policy", "backends", "rep", "ok", "err", "req_s", "goodput_s", "slo_pct",
		"p50_ms", "p99_ms", "hit_pct", "overpredict_pct", "max_share_pct", "max_avg_queue", "max_peak_queue", "per_backend"})
	w.Flush()
	if *mode == "pitfalls" {
		type pv struct {
			name string
			mod  func(*RouterConfig)
		}
		vs := []pv{
			{"kv-shadow", func(c *RouterConfig) {}},
			{"kv-events", func(c *RouterConfig) { c.TableMode = "events" }},
			{"kv-events-delay200ms", func(c *RouterConfig) { c.TableMode = "events"; c.EventDelay = 200 * time.Millisecond }},
			{"kv-events-tokmismatch", func(c *RouterConfig) { c.TableMode = "events"; c.Template = "mismatch" }},
			{"kv-shadow-table4x", func(c *RouterConfig) { c.TableBlocks = 4 * bcfg.CacheBlocks }},
		}
		for rep := 1; rep <= *reps; rep++ {
			for _, work := range strings.Split(*worksFlag, ",") {
				for _, v := range vs {
					c := baseRouterCfg("kv")
					v.mod(&c)
					row := runOne(v.name, work, 4, c, rep)
					writeRow(w, row)
				}
			}
		}
		return
	}
	for rep := 1; rep <= *reps; rep++ {
		for _, work := range strings.Split(*worksFlag, ",") {
			for _, bs := range strings.Split(*backendsFlag, ",") {
				nb, _ := strconv.Atoi(bs)
				pols := strings.Split(*policiesFlag, ",")
				if rep%2 == 0 { // alternate order between repetitions
					for i, j := 0, len(pols)-1; i < j; i, j = i+1, j-1 {
						pols[i], pols[j] = pols[j], pols[i]
					}
				}
				for _, p := range pols {
					writeRow(w, runOne("main", work, nb, baseRouterCfg(p), rep))
				}
			}
		}
	}
}
