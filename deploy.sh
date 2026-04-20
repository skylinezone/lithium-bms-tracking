#!/bin/bash
cd /workspace/lithium-tracking

echo "=== Build ==="
pnpm build 2>&1 | tail -3

echo "=== Copy assets ==="
mkdir -p docs/assets docs/images
cp dist/index.html docs/
cp dist/assets/*.css docs/assets/ 2>/dev/null || true
cp dist/assets/*.js docs/assets/ 2>/dev/null || true
echo "Copy done"

echo "=== Git add/commit ==="
git add -A
git commit -m "Update: $(date +%Y-%m-%d) 每日追踪" 2>&1

echo "=== Git push (attempt 1) ==="
max_retries=5; delay=5; attempt=1
while [ $attempt -le $max_retries ]; do
  echo "[Attempt $attempt]"
  if timeout 90 git push origin main 2>&1 | grep -qE 'Everything up-to-date|Compressing|Writing objects|new branch|to https'; then
    echo '✅ Push OK'; exit 0
  fi
  echo "  Retrying in ${delay}s..."
  sleep $delay; delay=$((delay*2)); attempt=$((attempt+1))
done
echo '❌ Push failed after retries'
exit 1
