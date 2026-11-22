#!/bin/bash
# Record the booted iOS Simulator's screen (the app only, no Simulator window chrome).
#   bash capture-ios.sh <out.mp4> <seconds> [device-udid]
# With more than one Simulator booted, pass the UDID: "booted" picks one of them.
# Records with RocketSim when its CLI answers, at 60 fps; otherwise, or with
# CAPTURE_BACKEND=simctl, with `simctl io recordVideo`. Drive the app while it records:
# `rocketsim do --step ...` flows (see references/capture.md), goldie/argent, or by hand.
# The status bar is set to 9:41, full signal and battery first, like Apple's own shots.
set -euo pipefail
out="$1"; secs="${2:-15}"; dev="${3:-booted}"
backend="${CAPTURE_BACKEND:-auto}"
if [ "$backend" = auto ]; then
  backend=simctl
  command -v rocketsim >/dev/null && rocketsim status 2>/dev/null | grep -q '"ok":true' && backend=rocketsim
fi
xcrun simctl status_bar "$dev" override --time 9:41 --dataNetwork wifi --wifiBars 3 \
  --cellularMode active --cellularBars 4 --batteryState discharging --batteryLevel 100 || true

record_simctl() {
  xcrun simctl io "$dev" recordVideo --codec=h264 --mask=ignored --force "$1" 2> /tmp/simrec.log &
  local pid=$!
  # simctl prints "Recording started" once the first frame lands
  for _ in $(seq 1 50); do grep -q "Recording started" /tmp/simrec.log 2>/dev/null && break; sleep 0.1; done
  sleep "$secs"
  kill -INT "$pid"; wait "$pid" || true
}

if [ "$backend" = rocketsim ]; then
  udid=()
  [ "$dev" != booted ] && udid=(--udid "$dev")
  raw="${out%.*}.raw.mp4"
  # A quota or IPC error leaves no usable file: fall back.
  if rocketsim video record ${udid[@]+"${udid[@]}"} --fps 60 --duration "$secs" > "$raw" 2> /tmp/rsrec.log \
     && [ -s "$raw" ]; then
    # RocketSim writes a variable frame rate; the edit wants constant 60.
    ffmpeg -v error -y -i "$raw" -vf fps=60 -c:v libx264 -crf 12 -preset slow \
      -pix_fmt yuv420p -color_range tv "$out"
    rm -f "$raw"
  else
    echo "rocketsim failed ($(tail -c 300 /tmp/rsrec.log)); recording with simctl" >&2
    rm -f "$raw"; backend=simctl; record_simctl "$out"
  fi
else
  record_simctl "$out"
fi
xcrun simctl status_bar "$dev" clear || true
echo "backend=$backend"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,avg_frame_rate -of csv=p=0 "$out"
