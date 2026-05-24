#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/deploy.sh [options]

Options:
  --branch <name>       Branch to deploy. Default: main
  --copy-to <path>      Copy dist/site/ to another web root after build
  --reload-nginx        Run nginx config test and reload nginx after deploy
  --skip-install        Skip npm ci
  -h, --help            Show this help

Examples:
  ./scripts/deploy.sh
  ./scripts/deploy.sh --reload-nginx
  ./scripts/deploy.sh --copy-to /www/wwwroot/tools.bg7ldb.top --reload-nginx
EOF
}

BRANCH="${DEPLOY_BRANCH:-main}"
COPY_TO="${DEPLOY_COPY_TO:-}"
RELOAD_NGINX="${DEPLOY_RELOAD_NGINX:-0}"
SKIP_INSTALL=0
GENERATED_FILES=(
  "apps/chinese-telecode/public/corpora/manifest.json"
)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      BRANCH="${2:?Missing branch name}"
      shift 2
      ;;
    --copy-to)
      COPY_TO="${2:?Missing copy target path}"
      shift 2
      ;;
    --reload-nginx)
      RELOAD_NGINX=1
      shift
      ;;
    --skip-install)
      SKIP_INSTALL=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 2
      ;;
  esac
done

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

run() {
  echo "+ $*"
  "$@"
}

restore_generated_files() {
  for file in "${GENERATED_FILES[@]}"; do
    if [[ -e "${file}" ]]; then
      run git restore -- "${file}"
    fi
  done
}

if [[ ! -d .git ]]; then
  echo "This script must run inside a git checkout." >&2
  exit 1
fi

restore_generated_files

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  echo "Tracked files have local changes. Commit, stash, or reset them before deploying." >&2
  git status --short --untracked-files=no >&2
  exit 1
fi

echo "Deploying ${REPO_ROOT}"
run git fetch origin "${BRANCH}"
run git checkout "${BRANCH}"
run git pull --ff-only origin "${BRANCH}"

if [[ "${SKIP_INSTALL}" != "1" ]]; then
  run npm ci
fi

run npm run build:site
restore_generated_files

SITE_DIR="${REPO_ROOT}/dist/site"
if [[ ! -f "${SITE_DIR}/index.html" ]]; then
  echo "Build did not produce ${SITE_DIR}/index.html" >&2
  exit 1
fi

if [[ -n "${COPY_TO}" ]]; then
  if ! command -v rsync >/dev/null 2>&1; then
    echo "rsync is required for --copy-to. Install it or point nginx directly at ${SITE_DIR}." >&2
    exit 1
  fi
  run mkdir -p "${COPY_TO}"
  run rsync -a --delete "${SITE_DIR}/" "${COPY_TO}/"
  echo "Copied site to ${COPY_TO}"
else
  echo "Site is ready at ${SITE_DIR}"
fi

if [[ "${RELOAD_NGINX}" == "1" ]]; then
  run sudo nginx -t
  run sudo systemctl reload nginx
fi

echo "Deploy complete."
