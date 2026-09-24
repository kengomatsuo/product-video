#!/bin/bash
# Record the booted iOS Simulator's screen (the app only, no Simulator window chrome).
#   bash capture-ios.sh <out.mov> <seconds> [device-udid]
# With more than one Simulator booted, pass the UDID: "booted" picks one of them.
# Drive the app while it records: goldie/argent flows, the iOS Simulator tool, or by hand.
# The status bar is set to 9:41, full signal and battery first, like Apple's own shots.
set -euo pipefail
out="$1"; secs="${2:-15}"; dev="${3:-booted}"
xcrun simctl status_bar "$dev" override --time 9:41 --dataNetwork wifi --wifiBars 3 \
  --cellularMode active --cellularBars 4 --batteryState discharging --batteryLevel 100 || true
xcrun simctl io "$dev" recordVideo --codec=h264 --mask=ignored --force "$out" 2> /tmp/simrec.log &
pid=$!
# simctl prints "Recording started" once the first frame lands
for _ in $(seq 1 50); do grep -q "Recording started" /tmp/simrec.log 2>/dev/null && break; sleep 0.1; done
sleep "$secs"
kill -INT "$pid"; wait "$pid" || true
xcrun simctl status_bar "$dev" clear || true
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,avg_frame_rate -of csv=p=0 "$out"
