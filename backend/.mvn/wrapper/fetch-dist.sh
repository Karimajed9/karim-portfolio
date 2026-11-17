#!/bin/sh
# Download one Maven distribution file.
# wget is tried first. A wget failure must not abort the build: curl is next.
# Options stay before the URL so wget2 (Ubuntu 26.04's wget) accepts them.
fetch_dist() {
  _url=$1
  _dest=$2
  if command -v wget >/dev/null 2>&1; then
    if wget --tries=3 --timeout=20 ${FETCH_DIST_QUIET:+--quiet} -O "$_dest" "$_url"; then
      return 0
    fi
    rm -f "$_dest"
  fi
  if command -v curl >/dev/null 2>&1; then
    if curl --retry 3 --retry-delay 1 -f -L ${FETCH_DIST_QUIET:+--silent} -o "$_dest" "$_url"; then
      return 0
    fi
    rm -f "$_dest"
  fi
  return 1
}
