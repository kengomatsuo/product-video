#!/usr/bin/env bash
# Save an App Store listing's screenshots, preview videos and three frames of each
# preview into <refs>/appstore-previews/<slug>-*. Public pages only, no login.
#   bash refs-appstore.sh <refs-dir> <slug> <app-id> [country]
set -uo pipefail
refs="${1:?refs dir}"; slug="${2:?slug}"; id="${3:?app id}"; cc="${4:-us}"
out="$refs/appstore-previews"; mkdir -p "$out"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
page=$(curl -sL -A "$UA" -H "Accept-Language: en-US,en;q=0.9" "https://apps.apple.com/$cc/app/id$id")

# screenshots: the page lists size templates; ask for 1290 px wide
i=0
for u in $(echo "$page" | grep -o 'https://is[0-9]-ssl\.mzstatic\.com/image/thumb/[^"]*{w}x{h}{c}\.{f}' | grep -v -e AppIcon -e Placeholder | sort -u | head -8); do
  i=$((i + 1)); f="$out/$slug-shot-$(printf %02d $i).png"
  curl -sL -o "$f" "${u%\{w\}x\{h\}\{c\}.\{f\}}1290x0w.png"
done

# preview videos are HLS; ffmpeg saves each, then three frames at 20/50/80 %
j=0
for m in $(echo "$page" | grep -o 'https://[^"]*\.m3u8[^"]*' | sort -u | head -3); do
  j=$((j + 1)); v="$out/$slug-preview-$j.mp4"
  ffmpeg -v error -y -i "$m" -c copy "$v" || continue
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$v"); d=${d%.*}; d=${d:-20}
  for p in 20 50 80; do ffmpeg -v error -y -ss $((d * p / 100)) -i "$v" -frames:v 1 -q:v 3 "$out/$slug-preview-$j-$p.jpg"; done
done
echo "$slug: $i screenshots, $j previews -> $out"
