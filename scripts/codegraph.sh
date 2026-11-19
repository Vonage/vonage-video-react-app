#!/bin/sh

set -eu

repository_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
codegraphcontext="/Users/jquesadachaves/.venvs/codegraphcontext/bin/cgc"

cd "$repository_root"

case "${1:-index}" in
  index)
    "$codegraphcontext" index . --summarize
    ;;
  rebuild)
    "$codegraphcontext" index . --force --summarize
    ;;
  stats)
    "$codegraphcontext" stats
    ;;
  doctor)
    "$codegraphcontext" doctor
    ;;
  *)
    echo "Usage: scripts/codegraph.sh [index|rebuild|stats|doctor]" >&2
    exit 2
    ;;
esac
