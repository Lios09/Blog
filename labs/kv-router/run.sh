#!/bin/bash
set -e
cd "$(dirname "$0")"
go build -o lab .
./lab -mode calibrate > calibration.txt 2>&1
GOMAXPROCS=8 ./lab -mode main -backends 2,4 -reps 3 -warm 4s -measure 15s > results.csv 2> benchmark-meta.txt
GOMAXPROCS=8 ./lab -mode pitfalls -workloads shared,hot -reps 3 -warm 4s -measure 15s > pitfalls.csv 2>> benchmark-meta.txt
date >> benchmark-meta.txt
