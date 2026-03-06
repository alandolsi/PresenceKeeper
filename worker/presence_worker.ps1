param(
  [Parameter(Mandatory = $false)]
  [ValidateRange(30, 900)]
  [int]$IntervalSeconds = 240
)

$ErrorActionPreference = 'Stop'

function Write-JsonLine {
  param([hashtable]$Payload)
  ($Payload | ConvertTo-Json -Compress) | Write-Output
}

try {
  $wsh = New-Object -ComObject WScript.Shell
  Write-JsonLine @{ type = 'started'; intervalSeconds = $IntervalSeconds; timestamp = (Get-Date).ToString('o') }

  while ($true) {
    $wsh.SendKeys('{F15}')
    $next = (Get-Date).AddSeconds($IntervalSeconds).ToString('o')
    Write-JsonLine @{ type = 'tick'; nextTickAt = $next; timestamp = (Get-Date).ToString('o') }
    Start-Sleep -Seconds $IntervalSeconds
  }
} catch {
  Write-JsonLine @{ type = 'error'; message = $_.Exception.Message; timestamp = (Get-Date).ToString('o') }
  exit 1
}
