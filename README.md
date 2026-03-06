# PresenceKeeper

PresenceKeeper is a Windows desktop app built with Electron to simulate periodic activity and keep presence from going idle.

## Developer
- Landolsi Webdesign <info@landolsi.de>
- https://landolsi.de

## Features
- Start and stop with dedicated controls.
- Configurable activity interval.
- Live countdown until the next activity trigger.
- Scheduled daily start and stop times.
- Local event logging.
- Windows installer pipeline ready (NSIS via electron-builder).

## Tech Stack
- Electron
- PowerShell worker process
- TailwindCSS-based renderer UI
- Lucide (Open Source icons via `lucide-static`)

## Project Structure
- `src/main.js`: Electron main process and worker orchestration.
- `src/preload.js`: Secure IPC bridge.
- `src/renderer/*`: UI layer.
- `worker/presence_worker.ps1`: Background key simulation worker.
- `ROADMAP.md`: Product milestones.
- `CHANGELOG.md`: Version history.

## Development
```bash
npm install
npm run dev
```

`npm run dev` builds Tailwind assets automatically via `predev`.

## Local Test (Windows)
1. Start app:
```bash
cd C:\dev\PresenceKeeper
npm install
npm run dev
```
2. In the app UI:
- Set interval (example: `60`).
- Click `START` (round button).
- Verify status changes to `Running` and countdown decreases.
- Click `STOP` and verify status returns to `Stopped`.
- Close the window and verify the app stays in system tray.
- Reopen using tray icon double-click or tray menu `Open`.
3. Schedule test:
- Enable schedule.
- Set start to 1-2 minutes from now and stop to 3-4 minutes from now.
- Save schedule and check log entries for auto start/stop.

## Build
```bash
npm run dist
```

Installer output appears in `dist\` (Windows NSIS setup executable).

## GitHub Release
Push a semantic version tag to trigger installer publishing:
```bash
git tag v0.1.1
git push origin main --tags
```

## Versioning
This repository follows Semantic Versioning (`MAJOR.MINOR.PATCH`).
Current version: `0.1.0`.

## Legal
Use this software responsibly and in accordance with your company policies.
