#!/bin/sh
set -eu

# Resolve the repository from this script, independently of the caller's cwd.
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
cd "$repo_root"

# uvx installs the pinned tool in its own cache; no personal virtualenv is used.
if ! command -v uvx >/dev/null 2>&1; then
  echo 'CodeGraphContext requires uv on PATH. Install uv, then restart your editor. See .kiro/steering/codegraph.md.' >&2
  exit 127
fi

mkdir -p .codegraphcontext
export CGC_EMBEDDED_BUFFER_POOL_MB="${CGC_EMBEDDED_BUFFER_POOL_MB:-512}"
export CGC_OUTPUT_FORMAT="${CGC_OUTPUT_FORMAT:-gcf}"
if [ "$#" -eq 0 ]; then
  set -- mcp start
fi
exec uvx --python 3.13 --with kuzu==0.11.3 --from codegraphcontext==0.6.13 cgc --database kuzudb --path "$repo_root/.codegraphcontext/graph.kuzu" "$@"
