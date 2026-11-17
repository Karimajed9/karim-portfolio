#!/bin/sh
# Exercises fetch_dist without touching the network.
set -eu

here=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
fetch_script=$here/fetch-dist.sh
mvnw_script=$here/../../mvnw

write_exec() {
  printf '%s\n' "$2" >"$1"
  chmod +x "$1"
}

run_fetch() {
  stubdir=$1
  dest=$2
  saved_path=$PATH
  # Stubs hide the real wget and curl. Keep /bin so rm can delete a partial file.
  PATH=$stubdir:/bin:/usr/bin
  export PATH
  # shellcheck disable=SC1090
  . "$fetch_script"
  status=1
  if fetch_dist "https://example.invalid/apache-maven.bin.zip" "$dest"; then
    status=0
  fi
  PATH=$saved_path
  export PATH
  return "$status"
}

wget_fails_curl_fetches() {
  dir=$(mktemp -d)
  write_exec "$dir/wget" '#!/bin/sh
printf "wget\n" >> "$CALL_LOG"
exit 1'
  write_exec "$dir/curl" '#!/bin/sh
printf "curl\n" >> "$CALL_LOG"
dest=
prev=
for arg in "$@"; do
  if [ "$prev" = "-o" ]; then
    dest=$arg
  fi
  prev=$arg
done
printf "from-curl\n" > "$dest"
exit 0'
  export CALL_LOG=$dir/calls
  : >"$CALL_LOG"
  dest=$dir/out
  if run_fetch "$dir" "$dest"; then
    got=$(cat "$dest")
    log=$(cat "$CALL_LOG")
  else
    echo "wget-fails-curl-fetches: fetch failed" >&2
    exit 1
  fi
  [ "$got" = "from-curl" ] || {
    echo "wget-fails-curl-fetches: unexpected body [$got]" >&2
    exit 1
  }
  [ "$log" = "wget
curl" ] || {
    echo "wget-fails-curl-fetches: unexpected tools [$log]" >&2
    exit 1
  }
  echo "wget-fails-curl-fetches"
}

wget_fetches_without_curl() {
  dir=$(mktemp -d)
  write_exec "$dir/wget" '#!/bin/sh
printf "wget\n" >> "$CALL_LOG"
dest=
prev=
for arg in "$@"; do
  if [ "$prev" = "-O" ]; then
    dest=$arg
  fi
  prev=$arg
done
printf "from-wget\n" > "$dest"
exit 0'
  write_exec "$dir/curl" '#!/bin/sh
printf "curl\n" >> "$CALL_LOG"
exit 1'
  export CALL_LOG=$dir/calls
  : >"$CALL_LOG"
  dest=$dir/out
  if run_fetch "$dir" "$dest"; then
    got=$(cat "$dest")
    log=$(cat "$CALL_LOG")
  else
    echo "wget-fetches-without-curl: fetch failed" >&2
    exit 1
  fi
  [ "$got" = "from-wget" ] || {
    echo "wget-fetches-without-curl: unexpected body [$got]" >&2
    exit 1
  }
  [ "$log" = "wget" ] || {
    echo "wget-fetches-without-curl: curl was used [$log]" >&2
    exit 1
  }
  echo "wget-fetches-without-curl"
}

both_fail() {
  dir=$(mktemp -d)
  write_exec "$dir/wget" '#!/bin/sh
printf "wget\n" >> "$CALL_LOG"
dest=
prev=
for arg in "$@"; do
  if [ "$prev" = "-O" ]; then
    dest=$arg
  fi
  prev=$arg
done
printf "partial" > "$dest"
exit 1'
  write_exec "$dir/curl" '#!/bin/sh
printf "curl\n" >> "$CALL_LOG"
dest=
prev=
for arg in "$@"; do
  if [ "$prev" = "-o" ]; then
    dest=$arg
  fi
  prev=$arg
done
printf "partial" > "$dest"
exit 1'
  export CALL_LOG=$dir/calls
  : >"$CALL_LOG"
  dest=$dir/out
  if run_fetch "$dir" "$dest"; then
    echo "both-fail: fetch unexpectedly succeeded" >&2
    exit 1
  fi
  if [ -e "$dest" ]; then
    echo "both-fail: partial download was kept" >&2
    exit 1
  fi
  echo "both-fail"
}

mvnw_uses_fallback() {
  grep -q '\. "$scriptDir/.mvn/wrapper/fetch-dist.sh"' "$mvnw_script" || {
    echo "mvnw-uses-fallback: mvnw does not source fetch-dist.sh" >&2
    exit 1
  }
  if grep -q 'die "wget: Failed to fetch' "$mvnw_script"; then
    echo "mvnw-uses-fallback: mvnw still aborts on the first wget failure" >&2
    exit 1
  fi
  grep -q -- '-O "$_dest" "$_url"' "$fetch_script" || {
    echo "mvnw-uses-fallback: wget -O is not before the URL" >&2
    exit 1
  }
  echo "mvnw-uses-fallback"
}

wget_fails_curl_fetches
wget_fetches_without_curl
both_fail
mvnw_uses_fallback
