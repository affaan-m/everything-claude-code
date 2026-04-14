#!/usr/bin/env bash
# Shared homunculus data-directory resolver.
#
# Sourced by observer-related shell scripts so the precedence and the
# absolute-path validation live in one place. Exposes:
#   _ecc_resolve_homunculus_dir  — prints the resolved absolute path
#
# Resolution precedence:
#   1. $CLV2_HOMUNCULUS_DIR (must be absolute; relative prints a warning
#      and falls through to the next tier)
#   2. $XDG_DATA_HOME/ecc-homunculus (XDG_DATA_HOME must be absolute per
#      XDG Base Directory spec; relative values warn and fall through)
#   3. $HOME/.local/share/ecc-homunculus
#
# Absolute-path validation matters because relative roots would make
# observer data land under the caller's cwd, silently splitting
# observations and instincts across sessions.

_ecc_resolve_homunculus_dir() {
  if [ -n "${CLV2_HOMUNCULUS_DIR:-}" ]; then
    case "$CLV2_HOMUNCULUS_DIR" in
      /*) printf '%s\n' "$CLV2_HOMUNCULUS_DIR"; return 0 ;;
      *) printf '[ecc] CLV2_HOMUNCULUS_DIR=%s is not absolute; ignoring\n' "$CLV2_HOMUNCULUS_DIR" >&2 ;;
    esac
  fi

  if [ -n "${XDG_DATA_HOME:-}" ]; then
    case "$XDG_DATA_HOME" in
      /*) printf '%s/ecc-homunculus\n' "$XDG_DATA_HOME"; return 0 ;;
      *) printf '[ecc] XDG_DATA_HOME=%s is not absolute; ignoring\n' "$XDG_DATA_HOME" >&2 ;;
    esac
  fi

  printf '%s/.local/share/ecc-homunculus\n' "$HOME"
}
