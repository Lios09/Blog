// 自己写的最小实现，非 Kinference 实现。
// Token-ish tokenizer, chat rendering and chained block hashing shared by the
// mock backend and the router.
package main

import (
	"container/list"
	"encoding/binary"
	"hash/fnv"
	"strings"
)

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// Template decides how messages become one prompt string. The backend always
// uses "engine"; the router can be configured with a different one to show
// what a tokenizer/chat-template mismatch does.
func Render(msgs []Message, template string) string {
	var b strings.Builder
	for _, m := range msgs {
		switch template {
		case "mismatch": // e.g. router forgot a BOS token / used another template
			b.WriteString("<s> [" + m.Role + "] ")
		default:
			b.WriteString("<|" + m.Role + "|> ")
		}
		b.WriteString(m.Content)
		b.WriteString(" ")
	}
	return b.String()
}

// Tokenize: one whitespace-separated word = one "token".
func Tokenize(s string) []string { return strings.Fields(s) }

// BlockHashes returns one hash per FULL block. Each hash chains the previous
// one, so equal hash at position i implies the whole prefix [0, i] is equal.
// A trailing partial block is not hashable (and not cacheable), like vLLM.
func BlockHashes(tokens []string, blockSize int) []uint64 {
	n := len(tokens) / blockSize
	out := make([]uint64, 0, n)
	var prev uint64
	var buf [8]byte
	for i := 0; i < n; i++ {
		h := fnv.New64a()
		binary.LittleEndian.PutUint64(buf[:], prev)
		h.Write(buf[:])
		for _, t := range tokens[i*blockSize : (i+1)*blockSize] {
			h.Write([]byte(t))
			h.Write([]byte{0})
		}
		prev = h.Sum64()
		out = append(out, prev)
	}
	return out
}

// BlockLRU is an LRU set of block hashes with a fixed capacity in blocks.
// Not goroutine-safe; callers lock.
type BlockLRU struct {
	cap   int
	ll    *list.List
	items map[uint64]*list.Element
}

func NewBlockLRU(capacity int) *BlockLRU {
	return &BlockLRU{cap: capacity, ll: list.New(), items: make(map[uint64]*list.Element)}
}

// MatchPrefix counts leading blocks present. Because hashes are chained,
// the first miss ends the usable prefix even if later blocks are present.
func (c *BlockLRU) MatchPrefix(hs []uint64) int {
	n := 0
	for _, h := range hs {
		if _, ok := c.items[h]; !ok {
			break
		}
		n++
	}
	return n
}

// Insert touches/inserts all hashes and returns evicted hashes. It walks the
// prompt tail-first so the head blocks end up most-recently-used: under
// pressure the tail of a prompt is evicted before its (shared) head, which
// would otherwise invalidate every chained block after it.
func (c *BlockLRU) Insert(hs []uint64) (evicted []uint64) {
	for i := len(hs) - 1; i >= 0; i-- {
		h := hs[i]
		if e, ok := c.items[h]; ok {
			c.ll.MoveToFront(e)
			continue
		}
		c.items[h] = c.ll.PushFront(h)
		for c.ll.Len() > c.cap {
			back := c.ll.Back()
			old := back.Value.(uint64)
			c.ll.Remove(back)
			delete(c.items, old)
			evicted = append(evicted, old)
		}
	}
	return evicted
}

func (c *BlockLRU) Len() int { return c.ll.Len() }
