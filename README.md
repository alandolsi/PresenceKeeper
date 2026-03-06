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
- Vanilla HTML/CSS/JS renderer

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

## Build
```bash
npm run dist
```

## Versioning
This repository follows Semantic Versioning (`MAJOR.MINOR.PATCH`).
Current version: `0.1.0`.

## Legal
Use this software responsibly and in accordance with your company policies.
