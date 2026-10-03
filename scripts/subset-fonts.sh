#!/usr/bin/env bash
# Builds light font files from the @fontsource packages so the page stays fast (Lighthouse mobile 90+):
#   Fraunces: optical size pinned at 144, weights 600 to 800 only
#   DM Sans:  weights 400 to 500 only
#   Caveat:   600, only the characters used on stickers and notes
# Output goes to public/fonts and is committed; Netlify does not run this.
# Needs: pip install fonttools brotli. Re-run after changing Caveat copy (see CAVEAT_TEXT).
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=public/fonts
TMP=$(mktemp -d)
mkdir -p "$OUT"
FS=node_modules/@fontsource-variable
LATIN="U+0020-007E,U+00A0-00FF,U+2013,U+2018-201E,U+2022,U+2026,U+2190-2193,U+2212"
CAVEAT_TEXT="50 FOUNDING SEATS · BY APPLICATION · MUMBAI · the part nobody else does Announcing soon opening [early 2027]"

woff2() { pyftsubset "$1" --unicodes="$2" --flavor=woff2 --layout-features='kern,liga,calt,ccmp,locl,mark,mkmk' --output-file="$3"; }
inst() { fonttools varLib.instancer "$1" ${@:3} -q -o "$2"; }

inst $FS/fraunces/files/fraunces-latin-opsz-normal.woff2 "$TMP/fn.ttf" wght=600:800 opsz=144
inst $FS/fraunces/files/fraunces-latin-opsz-italic.woff2 "$TMP/fi.ttf" wght=600:800 opsz=144
inst $FS/fraunces/files/fraunces-latin-ext-opsz-normal.woff2 "$TMP/fr.ttf" wght=600:800 opsz=144
inst $FS/dm-sans/files/dm-sans-latin-wght-normal.woff2 "$TMP/dn.ttf" wght=400:500
inst $FS/dm-sans/files/dm-sans-latin-ext-wght-normal.woff2 "$TMP/dr.ttf" wght=400:500

woff2 "$TMP/fn.ttf" "$LATIN" "$OUT/fraunces.woff2"
woff2 "$TMP/fi.ttf" "$LATIN" "$OUT/fraunces-italic.woff2"
woff2 "$TMP/fr.ttf" "U+20B9" "$OUT/fraunces-rupee.woff2"
woff2 "$TMP/dn.ttf" "$LATIN" "$OUT/dm-sans.woff2"
woff2 "$TMP/dr.ttf" "U+20B9" "$OUT/dm-sans-rupee.woff2"
pyftsubset node_modules/@fontsource/caveat/files/caveat-latin-600-normal.woff2 --text="$CAVEAT_TEXT" --layout-features=kern --flavor=woff2 --output-file="$OUT/caveat.woff2"
rm -rf "$TMP"
ls -la "$OUT"
