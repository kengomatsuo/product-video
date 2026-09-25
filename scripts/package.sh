#!/usr/bin/env bash
# Build dist/product-video.zip for the Claude app (Customize > Skills > Upload a skill).
# The ZIP holds the skill folder at its root, as the upload expects.
# Claude caps a skill at 30 MB uncompressed (docs.claude.com skills-guide, 2026-09-25).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
rm -rf dist && mkdir -p dist

bytes=$(find skills/product-video -type f ! -name .DS_Store ! -path '*/node_modules/*' -exec cat {} + | wc -c | tr -d ' ')
limit=$((30 * 1024 * 1024))
[ "$bytes" -le "$limit" ] || { echo "skill is $bytes bytes, over the 30 MB upload limit" >&2; exit 1; }

# The Claude app accepts only name, description, license, allowed-tools, metadata and
# compatibility (anthropics/skills quick_validate.py), so the Claude Code keys are folded in.
stage=$(mktemp -d); trap 'rm -rf "$stage"' EXIT
cp -R skills/product-video "$stage/"
bun -e '
const f = process.argv[1], t = await Bun.file(f).text();
const [, head, body] = t.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const get = (k) => head.match(new RegExp(`^${k}: (.*)$`, "m"))?.[1].replace(/^"|"$/g, "");
const description = `${get("description")} ${get("when_to_use") ?? ""}`.trim();
if (description.length > 1024) throw new Error(`description is ${description.length} chars, over 1024`);
await Bun.write(f, `---\nname: ${get("name")}\ndescription: ${JSON.stringify(description)}\n---\n${body}`);
' "$stage/product-video/SKILL.md"
(cd "$stage" && zip -qr -X "$OLDPWD/dist/product-video.zip" product-video -x '*.DS_Store' '*/node_modules/*')
echo "dist/product-video.zip: $(du -h dist/product-video.zip | cut -f1) zipped, $((bytes / 1048576)) MB uncompressed"
