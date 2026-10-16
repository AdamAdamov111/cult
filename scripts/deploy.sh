#!/usr/bin/env bash
# Пересобрать фронт и выложить на GitHub Pages (ветка gh-pages).
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build
touch dist/.nojekyll

rm -rf dist/.git
git -C dist init -q
git -C dist add -A
git -C dist -c user.email="adam.adamov.business@gmail.com" -c user.name="AdamAdamov111" \
    commit -q -m "deploy $(date +%F-%H%M)"
git -C dist push -q -f https://github.com/AdamAdamov111/cult.git HEAD:gh-pages
rm -rf dist/.git

echo "Готово: https://adamadamov111.github.io/cult/"
