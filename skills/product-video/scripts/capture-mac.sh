#!/bin/bash
# Record one macOS app window (a Mac app, or a browser showing a web app) at Retina size.
#   bash capture-mac.sh "<App Name>" <out.mov> <seconds>
# Finds the app's front window id, then screencapture records just that window.
# Needs Screen Recording permission for the terminal running it.
set -euo pipefail
app="$1"; out="$2"; secs="${3:-15}"
wid=$(swift -e '
import CoreGraphics
let name = CommandLine.arguments[1]
let list = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as! [[String: Any]]
if let w = list.first(where: { ($0[kCGWindowOwnerName as String] as? String) == name && ($0[kCGWindowLayer as String] as? Int) == 0 }) {
  print(w[kCGWindowNumber as String]!)
}' "$app")
[ -n "$wid" ] || { echo "no on-screen window for $app" >&2; exit 1; }
screencapture -x -v -V "$secs" -l "$wid" "$out"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,avg_frame_rate -of csv=p=0 "$out"
