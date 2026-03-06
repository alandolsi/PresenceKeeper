param(
  [string]$SourcePng = (Join-Path (Split-Path $PSScriptRoot -Parent) 'src\PresenceKeeper.png')
)

Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $SourcePng)) {
  throw "Source PNG not found: $SourcePng"
}

$buildDir = $PSScriptRoot
$pngOut = Join-Path $buildDir 'icon-256.png'
$icoOut = Join-Path $buildDir 'icon.ico'

$img = [System.Drawing.Image]::FromFile($SourcePng)
$bmp = New-Object System.Drawing.Bitmap($img, 256, 256)
$bmp.Save($pngOut, [System.Drawing.Imaging.ImageFormat]::Png)

$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = [System.IO.File]::Open($icoOut, [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

$img.Dispose()
$bmp.Dispose()

Write-Output "Generated icon from $SourcePng"
Write-Output $icoOut
