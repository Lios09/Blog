# kv-router-lab

自己写的最小实现，非 Kinference 实现，也不是 vLLM。Read ../kv-router.md for the article.

## Run

```sh
go test -v ./... && go test -race ./... && go vet ./...
./run.sh          # calibrate -> main (72 runs) -> pitfalls (30 runs), ~33 min
python3 summarize.py
```

Standard library only; go.mod targets Go 1.25+, measured on Go 1.27.3. Everything runs in one process over real localhost HTTP/SSE. No credentials, GPUs or external services.

## Files

- tokens.go: word "tokenizer", chat rendering (engine / mismatch templates), chained FNV-64 block hashes, block LRU
- backend.go: mock worker (LRU prefix cache 2500 blocks x 16 tokens, prefill 2 ms + 25 us/uncached token serialized per worker, decode 1.5 ms/token, 4 running slots, queue 64 -> 429, optional KV events)
- router.go: reverse proxy; policies rr | least | prefix | kv (uncached_tokens*0.025ms + inflight*12.5ms); table modes shadow | events
- loadgen.go: closed-loop clients; workloads shared | multiturn | hot
- main.go: experiment driver (modes calibrate | main | pitfalls)
- results.csv, pitfalls.csv, calibration.txt, summary.md, machine.txt, verification.txt, benchmark-meta.txt: measured outputs

## Limits

Mock numbers compare routing policies only; they are not real TTFT and are NOT comparable to Kinference's published benchmarks (95% median TTFT, 7.4x goodput). No real model, no batching interference, linear prefill, single concurrency level, three repetitions without confidence intervals, no new-prefix burst workload.
