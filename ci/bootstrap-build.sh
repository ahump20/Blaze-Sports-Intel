#!/usr/bin/env bash
set -Eeuo pipefail
trap 'code=$?; echo "❌ FAILED at line $LINENO (exit $code)"; tail -n +1 -v ./*.log || true; exit $code' ERR
set -x

# 1) Toolchain
if ! command -v node >/dev/null; then
  echo "Installing Node 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# 2) Clone safely (no spaces)
if [ -d repo ]; then
  rm -rf repo
fi

git clone --depth=1 --branch "${BRANCH:-main}" "https://github.com/ahump20/BI-Main.git" repo
cd repo

# 3) Install + build with verbose logs
npm ci --loglevel verbose 2>&1 | tee install.log
npm run build --loglevel verbose 2>&1 | tee build.log

# 4) Optional: headless link check (non-blocking example)
npm run check:links || echo "Link checker failed (non-blocking in CI)"
