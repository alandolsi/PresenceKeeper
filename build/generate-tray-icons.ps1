param(
  [string]$SourcePng = (Join-Path (Split-Path $PSScriptRoot -Parent) 'src\PresenceKeeper.png')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $SourcePng)) {
  throw "Source PNG not found: $SourcePng"
}

$size = 32
$img = [System.Drawing.Image]::FromFile($SourcePng)

function Save-TrayIcon {
  param(
    [string]$OutputPath,
    [System.Drawing.Color]$DotColor,
    [bool]$ShowDot
  )

  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.DrawImage($img, 0, 0, $size, $size)

  if ($ShowDot) {
    $dotSize = 14
    $x = $size - $dotSize - 1
    $y = $size - $dotSize - 1
    $dotBrush = New-Object System.Drawing.SolidBrush($DotColor)
    $ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(245, 255, 255, 255), 2)
    $g.FillEllipse($dotBrush, $x, $y, $dotSize, $dotSize)
    $g.DrawEllipse($ringPen, $x, $y, $dotSize, $dotSize)
    $dotBrush.Dispose()
    $ringPen.Dispose()
  }

  $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

$green = [System.Drawing.Color]::FromArgb(255, 34, 197, 94)
$red = [System.Drawing.Color]::FromArgb(255, 239, 68, 68)

Save-TrayIcon -OutputPath (Join-Path $PSScriptRoot 'tray-running.png') -DotColor $green -ShowDot $true
Save-TrayIcon -OutputPath (Join-Path $PSScriptRoot 'tray-running-blink.png') -DotColor $green -ShowDot $false
Save-TrayIcon -OutputPath (Join-Path $PSScriptRoot 'tray-stopped.png') -DotColor $red -ShowDot $true

$img.Dispose()
Write-Output 'Generated tray status icons.'
