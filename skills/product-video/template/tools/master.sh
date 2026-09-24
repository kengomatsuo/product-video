#!/bin/bash
# Final deliverable: lossless ProRes master, then a grain-tuned H.264 with its audio
# mastered to -14 LUFS, true peak under -1 dBTP.
#   bash tools/master.sh <CompositionId> <version> [--appstore]
# Why the second pass: at CRF 16 a mostly flat frame encodes at ~0.6 Mbps and gradients
# band. -tune grain, aq-mode=3 and 2% temporal noise as dither remove it (~12 Mbps).
set -euo pipefail
comp="${1:?composition id}"; v="${2:?version, e.g. v3}"; store="${3:-}"
mkdir -p out
master="out/master-$comp-$v.mov"; final="out/$comp-$v.mp4"
[ -e "$final" ] && { echo "$final exists: versions are never overwritten"; exit 1; }

bunx remotion render src/index.ts "$comp" "$master" --codec=prores --prores-profile=4444 --audio-codec=pcm-16

# loudness pass 1: measure
m=$(ffmpeg -hide_banner -i "$master" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$m" | grep "\"$1\"" | cut -d'"' -f4; }

if [ "$store" = "--appstore" ]; then
  # Apple: H.264 High <= L4.0, 10-12 Mbps, <= 30 fps, stereo AAC 256 kbps
  venc=(-r 30 -c:v libx264 -profile:v high -level 4.0 -preset slow -tune grain -x264-params aq-mode=3 -b:v 11M -maxrate 12M -bufsize 24M)
  aenc=(-c:a aac -b:a 256k -ac 2)
else
  venc=(-c:v libx264 -profile:v high -preset slow -crf 14 -tune grain -x264-params aq-mode=3)
  aenc=(-c:a aac -b:a 320k -ac 2)
fi

# pass 2: encode with dither, apply the measured loudness correction
ffmpeg -v error -y -i "$master" -vf "noise=alls=2:allf=t+u" "${venc[@]}" -pix_fmt yuv420p \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
  "${aenc[@]}" -movflags +faststart "$final"

echo "loudness of the delivered file:"
ffmpeg -hide_banner -i "$final" -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I:|Peak:)' | tail -2
ffprobe -v error -show_entries stream=codec_name,width,height,avg_frame_rate:format=duration,bit_rate -of compact "$final"
