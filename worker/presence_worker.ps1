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

# Use a tiny mouse move pulse instead of keyboard lock keys to avoid OSD notifications
# such as "Num Lock activated" on some Windows setups.
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class NativeInput {
  [DllImport("user32.dll", SetLastError = true)]
  public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);
}
"@

function Send-ActivityPulse {
  $MOUSEEVENTF_MOVE = 0x0001
  [NativeInput]::mouse_event($MOUSEEVENTF_MOVE, 1, 0, 0, [UIntPtr]::Zero)
  Start-Sleep -Milliseconds 40
  [NativeInput]::mouse_event($MOUSEEVENTF_MOVE, 4294967295, 0, 0, [UIntPtr]::Zero) # -1 (unsigned)
}

try {
  Write-JsonLine @{
    type = 'started'
    intervalSeconds = $IntervalSeconds
    mode = 'mouse-pulse'
    timestamp = (Get-Date).ToString('o')
  }

  while ($true) {
    Send-ActivityPulse
    $next = (Get-Date).AddSeconds($IntervalSeconds).ToString('o')
    Write-JsonLine @{ type = 'tick'; nextTickAt = $next; timestamp = (Get-Date).ToString('o') }
    Start-Sleep -Seconds $IntervalSeconds
  }
} catch {
  Write-JsonLine @{ type = 'error'; message = $_.Exception.Message; timestamp = (Get-Date).ToString('o') }
  exit 1
}
