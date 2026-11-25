#!/bin/bash
# setup.sh   one-time install for sfx.py and mix.py, into ~/.cache/audio-tools (the folder the music tools use too).
# Safe to run again: every step is skipped when its result is already there. About 7.6 GB of models, no account, no key.
#   venv/                     Python 3.12 with torch, transformers, numpy (and mlx-audio on a Mac)
# Off macOS (a cloud session, through cloud.sh) it installs CPU torch and skips mlx-audio and the Qwen caption model,
# which run only on Apple silicon.
#   models/clap-htsat-unfused LAION-CLAP, Apache-2.0, 0.6 GB: ranks a sound against words
#   models/ast-audioset       AudioSet tagger, BSD-3-Clause, 0.35 GB: names what a second model hears
#   models/qwen2-audio-4bit   Qwen2-Audio-7B-Instruct for MLX, Apache-2.0, 6.6 GB: writes the one-sentence caption
set -e
H=${SFX_HOME:-$HOME/.cache/audio-tools}; M=$H/models
mkdir -p "$M"
mac=; [ "$(uname)" = Darwin ] && mac=1
if [ ! -x "$H/venv/bin/python" ]; then
  if command -v uv >/dev/null; then uv venv -q --python 3.12 "$H/venv"; pip=(uv pip install -q --python "$H/venv/bin/python")
  else python3 -m venv "$H/venv"; pip=("$H/venv/bin/python" -m pip install -q); fi
  if [ -n "$mac" ]; then "${pip[@]}" torch 'transformers<5' numpy mlx-audio
  else "${pip[@]}" torch --index-url https://download.pytorch.org/whl/cpu && "${pip[@]}" 'transformers<5' numpy; fi
fi
get() {  # get <repo> <dest> <file>...   a Hugging Face file in 16 ranged parts; the plain client stalls on slow links
  repo=$1; dest=$2; shift 2; mkdir -p "$dest"
  for f in "$@"; do
    [ -s "$dest/$f" ] && continue
    url="https://huggingface.co/$repo/resolve/main/$f"
    size=$(curl -sIL "$url" | grep -i '^content-length' | tail -1 | tr -dc 0-9)
    if [ "${size:-0}" -lt 20000000 ]; then curl -sL -o "$dest/$f" "$url"; echo "ok $f"; continue; fi
    mkdir -p "$dest/.parts"; parts=16; chunk=$(( (size + parts - 1) / parts ))
    for i in $(seq 0 $((parts - 1))); do
      s=$((i * chunk)); e=$((s + chunk - 1)); [ $e -ge $size ] && e=$((size - 1))
      ( curl -sL --retry 10 -r $s-$e -o "$dest/.parts/$i" "$url" ) &
    done
    wait
    cat $(for i in $(seq 0 $((parts - 1))); do echo "$dest/.parts/$i"; done) > "$dest/$f"
    [ "$(wc -c < "$dest/$f" | tr -d ' ')" -eq "$size" ] && rm -rf "$dest/.parts" && echo "ok $f $size" || { echo "size mismatch on $f: run again"; exit 1; }
  done
}
get laion/clap-htsat-unfused "$M/clap-htsat-unfused" config.json preprocessor_config.json tokenizer_config.json vocab.json merges.txt tokenizer.json special_tokens_map.json pytorch_model.bin
get MIT/ast-finetuned-audioset-10-10-0.4593 "$M/ast-audioset" config.json preprocessor_config.json model.safetensors
[ -n "$mac" ] && get mlx-community/Qwen2-Audio-7B-Instruct-4bit "$M/qwen2-audio-4bit" config.json preprocessor_config.json tokenizer_config.json vocab.json merges.txt tokenizer.json weights.safetensors
echo "ready: $H/venv/bin/python -I $(dirname "$0")/sfx.py find \"a soft fingertip tap on glass\" --query \"finger tap\" --out picks/tap"
