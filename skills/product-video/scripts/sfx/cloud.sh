#!/bin/bash
# Runs `sfx.py batch` in a cloud session, so the sound models never load on the Mac (a batch there grew to 9.5 GB and
# swapped every other session). From the film's folder, with the moments file committed:
#   bash ~/.claude/skills/product-video/scripts/sfx/cloud.sh moments.json picks
# On the Mac it hands itself to cloud-run.ts, which pushes, runs it on the pushed commit and brings <out>/ back here.
# In the cloud it clones this public repo, installs CPU torch and the CLAP and AST models (about 1 GB, no account) and
# runs the batch. Captions (Qwen2-Audio, MLX) run only on Apple silicon, so a moment with "caption" fails there.
set -euo pipefail
[ $# -eq 2 ] || { echo "usage: cloud.sh <moments.json> <out dir>" >&2; exit 2; }
moments=$1; out=$2
if [ "$(uname)" = Darwin ]; then
  [ -f "$moments" ] || { echo "cloud.sh: no $moments here" >&2; exit 2; }
  if [ -n "$(git status --porcelain -- "$moments")" ]; then
    echo "cloud.sh: $moments is not committed; the cloud runs the pushed commit. Commit it, then run this again." >&2; exit 3
  fi
  rel=$(git rev-parse --show-prefix); tmp=$(mktemp -d); code=0
  bun "$HOME/.claude/scripts/cloud-run.ts" --out "$tmp" --files "$out" -- \
    "git clone -q --depth 1 https://github.com/kengomatsuo/product-video /tmp/pv && bash /tmp/pv/skills/product-video/scripts/sfx/cloud.sh '$moments' '$out'" || code=$?
  if [ -d "$tmp/files/$rel$out" ]; then mkdir -p "$out" && cp -R "$tmp/files/$rel$out/." "$out/" && echo "cloud.sh: picks are in $out/"; fi
  exit $code
fi
here=$(cd "$(dirname "$0")" && pwd)
bash "$here/setup.sh"
"${SFX_HOME:-$HOME/.cache/audio-tools}/venv/bin/python" -I "$here/sfx.py" batch "$moments" --out "$out" --caption 0
