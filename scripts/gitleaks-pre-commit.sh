#!/bin/sh
# Opt-in local secret scan. Does not change git config or core.hooksPath.
# Commits are unchanged unless GITLEAKS_PRE_COMMIT=1.
# Requires gitleaks v8.30.1 on PATH when that variable is set.
if [ "$GITLEAKS_PRE_COMMIT" != "1" ]; then
  exit 0
fi

if ! command -v gitleaks >/dev/null 2>&1; then
  echo "GITLEAKS_PRE_COMMIT=1 but gitleaks is not on PATH. Install v8.30.1 or unset GITLEAKS_PRE_COMMIT." >&2
  exit 1
fi

exec gitleaks protect --staged --redact --no-banner
