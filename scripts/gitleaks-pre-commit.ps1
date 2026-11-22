# Opt-in local secret scan. Does not change git config or core.hooksPath.
# Commits are unchanged unless GITLEAKS_PRE_COMMIT=1.
# Requires gitleaks v8.30.1 on PATH when that variable is set.
$ErrorActionPreference = "Stop"

if ($env:GITLEAKS_PRE_COMMIT -ne "1") {
  exit 0
}

$gitleaks = Get-Command gitleaks -ErrorAction SilentlyContinue
if (-not $gitleaks) {
  Write-Error "GITLEAKS_PRE_COMMIT=1 but gitleaks is not on PATH. Install v8.30.1 or unset GITLEAKS_PRE_COMMIT."
  exit 1
}

& gitleaks protect --staged --redact --no-banner
exit $LASTEXITCODE
