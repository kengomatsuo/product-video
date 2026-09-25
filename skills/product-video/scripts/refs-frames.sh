#!/usr/bin/env bash
# Frames of a reference video for study: N frames evenly spaced, and one frame per cut.
#   bash refs-frames.sh <video> <out-prefix> [N=6]
# A launch film from YouTube or a company site: download it with yt-dlp first.
set -euo pipefail
v="${1:?video}"; o="${2:?out prefix}"; n="${3:-6}"
mkdir -p "$(dirname "$o")"
d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v")
for k in $(seq 1 "$n"); do
  ffmpeg -v error -y -ss "$(awk -v d="$d" -v k="$k" -v n="$n" 'BEGIN{printf "%.2f", d*k/(n+1)}')" -i "$v" -frames:v 1 -q:v 3 -vf "scale='min(1600,iw)':-2" "$o-$(printf %02d "$k").jpg"
done
# cuts: scene change above 0.3; the timestamps are the film's shot lengths
ffmpeg -hide_banner -i "$v" -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep -o 'pts_time:[0-9.]*' | cut -d: -f2 > "$o-cuts.txt"
echo "$o: $n frames, $(wc -l < "$o-cuts.txt" | tr -d ' ') cuts in $(printf %.1f "$d") s"
