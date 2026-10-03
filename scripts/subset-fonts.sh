#!/usr/bin/env bash
# Builds light font files from the @fontsource packages so the page stays fast (Lighthouse mobile 90+):
#   Figtree:             weights 400 to 900, Latin, plus a tiny file for the rupee sign
#   Mrs Saint Delafield: only the characters used in script words (see SCRIPT_TEXT)
# Output goes to public/fonts and is committed; Netlify does not run this.
# Needs: pip install fonttools brotli. Re-run after changing any script word.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/fonts
TMP=$(mktemp -d)
mkdir -p "$OUT"
rm -f "$OUT"/*.woff2
FIG=node_modules/@fontsource-variable/figtree/files
LATIN="U+0020-007E,U+00A0-00FF,U+2013,U+2018-201E,U+2022,U+2026,U+2212"
# Every word set in the script face, plus a little headroom.
SCRIPT_TEXT="looking for panels one room know room table done it word 50 invite questions abcdefghijklmnopqrstuvwxyz.,'"

woff2() { pyftsubset "$1" --unicodes="$2" --flavor=woff2 --layout-features='kern,liga,calt,ccmp,locl,mark,mkmk,tnum' --output-file="$3"; }

fonttools varLib.instancer $FIG/figtree-latin-wght-normal.woff2 wght=400:900 -q -o "$TMP/fn.ttf"
fonttools varLib.instancer $FIG/figtree-latin-ext-wght-normal.woff2 wght=400:900 -q -o "$TMP/fr.ttf"
woff2 "$TMP/fn.ttf" "$LATIN" "$OUT/figtree.woff2"
woff2 "$TMP/fr.ttf" "U+20B9" "$OUT/figtree-rupee.woff2"
pyftsubset node_modules/@fontsource/mrs-saint-delafield/files/mrs-saint-delafield-latin-400-normal.woff2 \
  --text="$SCRIPT_TEXT" --layout-features='kern,liga,calt' --flavor=woff2 --output-file="$OUT/script.woff2"
rm -rf "$TMP"
ls -la "$OUT"
