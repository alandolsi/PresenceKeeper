# Build Assets

Windows app icon assets for PresenceKeeper.

Files:
- `build/icon.ico` (used by Electron and NSIS installer)
- `build/icon-256.png` (source preview image)
- `build/generate-icon.ps1` (regenerates both icon files)

Regenerate icon:
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\build\generate-icon.ps1
```
