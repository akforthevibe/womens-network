#!/usr/bin/env bash
# Builds light font files from the @fontsource packages so the page stays fast (Lighthouse mobile 90+):
#   Figtree (sans):               weights 400 to 800, Latin plus the rupee sign
#   Mrs Saint Delafield (script): Latin letters and punctuation only
# If licensed Moonlith and February files arrive, drop them in public/fonts and point the
# @font-face rules in src/styles/global.css at them; the font stacks already list them first.
# Output goes to public/fonts and is committed; Netlify does not run this.
# Needs: pip install fonttools brotli
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/fonts
TMP=$(mktemp -d)
rm -rf "$OUT" && mkdir -p "$OUT"
LATIN="U+0020-007E,U+00A0-00FF,U+2013,U+2018-201E,U+2022,U+2026,U+2190-2193,U+2212,U+2713"

fonttools varLib.instancer node_modules/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2 wght=400:800 -q -o "$TMP/f.ttf"
fonttools varLib.instancer node_modules/@fontsource-variable/figtree/files/figtree-latin-ext-wght-normal.woff2 wght=400:800 -q -o "$TMP/fx.ttf"
pyftsubset "$TMP/f.ttf" --unicodes="$LATIN" --layout-features='kern,liga,calt,ccmp,locl,mark,mkmk' --flavor=woff2 --output-file="$OUT/figtree.woff2"
pyftsubset "$TMP/fx.ttf" --unicodes="U+20B9" --flavor=woff2 --output-file="$OUT/figtree-rupee.woff2"
pyftsubset node_modules/@fontsource/mrs-saint-delafield/files/mrs-saint-delafield-latin-400-normal.woff2 --unicodes="U+0020-007E,U+2019" --layout-features='kern,liga,calt' --flavor=woff2 --output-file="$OUT/mrs-saint-delafield.woff2"
rm -rf "$TMP"
ls -la "$OUT"
