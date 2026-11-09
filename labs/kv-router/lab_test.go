package main

import (
	"testing"
)

func toks(n int, tag string) []string {
	out := make([]string, n)
	for i := range out {
		out[i] = tag + string(rune('a'+i%26))
	}
	return out
}

func TestChainedHashesSharePrefixOnly(t *testing.T) {
	a := append(toks(64, "s"), toks(20, "x")...)
	b := append(toks(64, "s"), toks(20, "y")...)
	ha, hb := BlockHashes(a, 16), BlockHashes(b, 16)
	if len(ha) != 5 || len(hb) != 5 { // 84 tokens -> 5 full blocks, partial dropped
		t.Fatalf("blocks %d %d", len(ha), len(hb))
	}
	for i := 0; i < 4; i++ {
		if ha[i] != hb[i] {
			t.Fatalf("shared block %d differs", i)
		}
	}
	if ha[4] == hb[4] {
		t.Fatal("divergent block should differ")
	}
	// Same block content at a different position must hash differently.
	c := append(toks(16, "q"), toks(64, "s")...)
	if BlockHashes(c, 16)[1] == ha[0] {
		t.Fatal("hash must depend on the whole prefix")
	}
}

func TestLRUEvictsTailBeforeHead(t *testing.T) {
	c := NewBlockLRU(4)
	c.Insert([]uint64{1, 2, 3, 4})
	c.Insert([]uint64{1, 9}) // shares head 1, adds 9
	if got := c.MatchPrefix([]uint64{1, 2, 3}); got != 1 && got != 2 && got != 3 {
		t.Fatalf("unexpected match %d", got)
	}
	if c.MatchPrefix([]uint64{1}) != 1 {
		t.Fatal("hot head block was evicted")
	}
	if c.Len() != 4 {
		t.Fatalf("len %d", c.Len())
	}
}

func TestMatchStopsAtFirstMiss(t *testing.T) {
	c := NewBlockLRU(10)
	c.Insert([]uint64{1, 3})
	if c.MatchPrefix([]uint64{1, 2, 3}) != 1 {
		t.Fatal("must stop at first missing block")
	}
}

func TestPolicies(t *testing.T) {
	hs := BlockHashes(toks(1024, "p"), 16)
	mk := func(p string) *Router {
		c := baseRouterCfg(p)
		r := NewRouter(c, []string{"a", "b"})
		r.tables[0].Insert(hs) // worker 0 holds the whole prefix
		return r
	}
	// prefix-only ignores load
	r := mk("prefix")
	r.inflight[0] = 100
	if i, _ := r.pick(1024, hs); i != 0 {
		t.Fatal("prefix policy should stick to the cached worker")
	}
	// kv: 1024 uncached tokens * 0.025 = 25.6ms > 1 in-flight * 12.5ms -> stays
	r = mk("kv")
	r.inflight[0] = 1
	if i, p := r.pick(1024, hs); i != 0 || p != 1024 {
		t.Fatalf("kv should prefer cache: %d %d", i, p)
	}
	// ...but spills once the queue cost dominates
	r.inflight[0] = 3
	if i, _ := r.pick(1024, hs); i != 1 {
		t.Fatal("kv should spill to the idle worker")
	}
	r = mk("rr")
	a, _ := r.pick(1024, hs)
	b, _ := r.pick(1024, hs)
	if a == b {
		t.Fatal("rr should alternate")
	}
}

func TestMismatchedTemplateBreaksAllHashes(t *testing.T) {
	m := []Message{{"system", "x y z"}, {"user", string(make([]byte, 0))}}
	e := BlockHashes(Tokenize(Render(m, "engine")+" "+repeat("w", 64)), 16)
	o := BlockHashes(Tokenize(Render(m, "mismatch")+" "+repeat("w", 64)), 16)
	for i := range min(len(e), len(o)) {
		if e[i] == o[i] {
			t.Fatalf("block %d unexpectedly equal", i)
		}
	}
}

func repeat(w string, n int) string {
	s := ""
	for i := 0; i < n; i++ {
		s += w + " "
	}
	return s
}
