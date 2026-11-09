#!/usr/bin/env python3
"""Column-wise medians over repetitions. Each column's median may come from a different rep."""
import csv, statistics, sys
from collections import defaultdict

COLS = ["req_s", "goodput_s", "slo_pct", "p50_ms", "p99_ms", "hit_pct", "overpredict_pct",
        "max_share_pct", "max_avg_queue", "max_peak_queue", "err"]

def summarize(path, key):
    rows = list(csv.DictReader(open(path)))
    g = defaultdict(list)
    for r in rows:
        g[tuple(r[k] for k in key)].append(r)
    out = []
    hdr = "| " + " | ".join(key + ["reps"] + COLS) + " |"
    out.append(hdr)
    out.append("|" + "---|" * (len(key) + 1 + len(COLS)))
    for k, rs in g.items():
        vals = [f"{statistics.median(float(r[c]) for r in rs):.2f}" for c in COLS]
        out.append("| " + " | ".join(list(k) + [str(len(rs))] + vals) + " |")
    return "\n".join(out)

with open("summary.md", "w") as f:
    f.write("# main (median of reps)\n\n" + summarize("results.csv", ["workload", "backends", "policy"]) + "\n\n")
    try:
        f.write("# pitfalls, 4 backends, policy kv (median of reps)\n\n" + summarize("pitfalls.csv", ["workload", "exp"]) + "\n")
    except FileNotFoundError:
        pass
print(open("summary.md").read())
