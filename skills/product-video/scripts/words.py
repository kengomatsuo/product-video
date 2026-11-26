"""When each sung or spoken word of a track starts, read by speech-to-text (mlx-whisper, Apple silicon).
A word found here is confirmed on the vocal stem (demucs) before a picture hit is put on it: the stem's envelope peaks
give the syllable to the hundredth of a second, and the transcript says which word each peak is.
  ~/.cache/audio-tools/venv/bin/python -I words.py <track or stem> [--prompt "words you expect"] [--lang en]
Slowing the clip to half speed first (ffmpeg -af atempo=0.5) separates fast repeats; halve the times it prints."""
import sys
import mlx_whisper

args = sys.argv[1:]
def opt(name, fallback):
    if name in args:
        i = args.index(name); value = args[i + 1]; del args[i:i + 2]; return value
    return fallback
prompt, lang = opt('--prompt', None), opt('--lang', 'en')
r = mlx_whisper.transcribe(args[0], path_or_hf_repo='mlx-community/whisper-large-v3-turbo', word_timestamps=True, language=lang, condition_on_previous_text=False, initial_prompt=prompt)
for s in r['segments']:
    for w in s.get('words', []):
        print(f"{w['start']:7.3f}-{w['end']:7.3f} {w['word']}")
