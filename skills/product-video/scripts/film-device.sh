#!/bin/bash
# The simulator a film records on is the device queue's own iPhone or iPad, held under the caller's lease: the Mac keeps
# one booted iPhone and one booted iPad, and a separate stock film simulator beside them took 2 GB more than a slim one.
#   bash film-device.sh up iphone|ipad   prints the UDID of the pool simulator your lease holds. Lease it first:
#       bun ~/.claude/scripts/device-queue/device-queue.ts lease iphone|ipad --who <name> --cap <min>
#       export DEVICE_QUEUE_TICKET=<the t<digits>-<hex4> id it printed>
#   bash film-device.sh down             deletes any "Film ..." simulator an older version of this script left behind;
#                                        then release the lease: device-queue.ts release "$DEVICE_QUEUE_TICKET"
# The pool simulators are slim (simslim). A take that needs a service slim turns off runs
# `simslim enable <udid> <category>` (names from `simslim profiles`) first; the next ticket restores the slim set.
# Never record on, boot or create any other simulator: the rest belong to other sessions.
set -euo pipefail

queue="${DEVICE_QUEUE_DIR:-$HOME/Shared/device-queue}/ios-sim"

case "${1:-}" in
  up)
    form="${2:-}"
    [[ "$form" == iphone || "$form" == ipad ]] || { echo "usage: film-device.sh up iphone|ipad" >&2; exit 2; }
    ticket=$(grep -oE 't[0-9]+-[0-9a-f]{4}' <<<"${DEVICE_QUEUE_TICKET:-}" | head -1 || true)
    if [ -z "$ticket" ]; then
      echo "film-device: no lease. Run: bun ~/.claude/scripts/device-queue/device-queue.ts lease $form --who <name> --cap <min>, then export DEVICE_QUEUE_TICKET=<its id> and run this again." >&2
      exit 3
    fi
    read -r state udid < <(bun -e '
      const fs = require("fs"); const [file, forms] = process.argv.slice(1);
      let t = {}; try { t = JSON.parse(fs.readFileSync(file, "utf8")) } catch {}
      let f = {}; try { f = JSON.parse(fs.readFileSync(forms, "utf8")) } catch {}
      const want = process.argv[3];
      const form = t.udid ? (f[t.udid] ?? "iphone") : "";
      console.log((t.state ?? "missing") + " " + (t.udid && form === want ? t.udid : "-"))' "$queue/$ticket/ticket.json" "$queue/forms.json" "$form")
    if [ "$state" != granted ]; then
      echo "film-device: lease $ticket is $state, not held. Wait for it: bun ~/.claude/scripts/device-queue/device-queue.ts wait $ticket" >&2
      exit 4
    fi
    if [ "$udid" = - ]; then
      echo "film-device: lease $ticket does not hold an $form. Release it and lease $form." >&2
      exit 5
    fi
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
