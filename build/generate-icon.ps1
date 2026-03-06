Add-Type -AssemblyName System.Drawing

$buildDir = Join-Path $PSScriptRoot '.'
$pngPath = Join-Path $buildDir 'icon-256.png'
$icoPath = Join-Path $buildDir 'icon.ico'

$size = 256
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.Clear([System.Drawing.Color]::FromArgb(0,0,0,0))

$rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(20,184,166), [System.Drawing.Color]::FromArgb(8,47,73), 45)
$g.FillEllipse($grad, 10, 10, $size-20, $size-20)

$ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180,255,255,255), 8)
$g.DrawEllipse($ringPen, 18, 18, $size-36, $size-36)

$font = New-Object System.Drawing.Font('Segoe UI Semibold', 88, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245,255,255,255))
$g.DrawString('P', $font, $brush, (New-Object System.Drawing.RectangleF(0,0,$size,$size)), $sf)

$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$hIcon = $bmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = [System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

$g.Dispose(); $bmp.Dispose(); $grad.Dispose(); $ringPen.Dispose(); $font.Dispose(); $brush.Dispose(); $sf.Dispose()

Write-Output "Generated $icoPath"
