#!/bin/bash
# The one simulator a film records on, so films stop leaving devices behind (each costs 3 to 20 GB).
#   bash film-device.sh up iphone|ipad   finds or creates "Film iPhone" / "Film iPad", boots it, prints its UDID
#   bash film-device.sh down             shuts down and deletes every "Film ..." simulator; run it after the final render
# Never record on, boot or create any other simulator: the rest belong to other sessions.
# generated-files-sweep.ts deletes a "Film ..." simulator left shut down for two days.
set -euo pipefail

udid_of() { xcrun simctl list devices | sed -nE "s/^ +$1 \(([0-9A-F-]{36})\).*/\1/p" | head -1; }

case "${1:-}" in
  up)
    case "${2:-}" in
      iphone) name="Film iPhone"; type="iPhone 18 Pro Max" ;;
      ipad) name="Film iPad"; type="iPad Pro 13-inch (M5)" ;;
      *) echo "usage: film-device.sh up iphone|ipad" >&2; exit 2 ;;
    esac
    udid=$(udid_of "$name")
    if [ -z "$udid" ]; then
      runtime=$(xcrun simctl list runtimes | sed -nE 's/^iOS .* - (com\.apple\.CoreSimulator\.SimRuntime\.iOS-[0-9-]+)$/\1/p' | tail -1)
      udid=$(xcrun simctl create "$name" "$type" "$runtime")
    fi
    xcrun simctl bootstatus "$udid" -b >/dev/null
    echo "$udid"
    ;;
  down)
    xcrun simctl list devices | sed -nE 's/^ +(Film [^(]+) \(([0-9A-F-]{36})\).*/\2 \1/p' | while read -r udid name; do
      xcrun simctl shutdown "$udid" 2>/dev/null || true
      xcrun simctl delete "$udid" && echo "deleted $name $udid"
    done
    ;;
  *) echo "usage: film-device.sh up iphone|ipad | down" >&2; exit 2 ;;
esac
