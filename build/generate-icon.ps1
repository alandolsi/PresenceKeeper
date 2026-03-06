param(
  [string]$SourcePng = (Join-Path (Split-Path $PSScriptRoot -Parent) 'src\PresenceKeeper.png')
)

$ErrorActionPreference = 'Stop'
$scriptPath = Join-Path $PSScriptRoot 'generate-icon.mjs'
if (-not (Test-Path $scriptPath)) {
  throw "Missing Node icon generator script: $scriptPath"
}

node $scriptPath
