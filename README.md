# PresenceKeeper

PresenceKeeper is a Windows desktop app (Electron + PowerShell) to keep activity from going idle with manual controls, scheduler automation, tray mode, and automatic updates.

If PresenceKeeper helps you, please support the project with a GitHub Star.
Use this software only where permitted by your employer policies and local law.
This project does not support deceptive or policy-violating use.

## Why PresenceKeeper
- Fast `Start` / `Stop` runtime controls
- Configurable interval (`30` to `900` seconds)
- Daily scheduler with start and stop time
- Runs in system tray
- Optional Windows auto-start
- Built-in update checks for installed releases
- Multi-language UI: English, Deutsch, Francais

## Features
- Runtime dashboard with status and countdown
- Settings tab for interval, language, and startup behavior
- Scheduler tab for daily automation
- Event log (hidden by default, toggle when needed)
- Local worker script orchestration via PowerShell
- NSIS installer generation via `electron-builder`

## Recommended Use Cases (Proper Use)
- Keep your own workstation active during long reading or writing sessions.
- Prevent unnecessary idle transitions during local presentations or demos.
- Validate scheduling and tray behavior in QA/test environments.
- Run controlled daily activity windows on personal devices.

Proper use is essential:
- Only use PresenceKeeper where permitted by employer policy, contract terms, and local law.
- Do not use this app for deceptive, misleading, or policy-violating activity.

## Install (Windows)
1. Open latest release:
   - `https://github.com/alandolsi/PresenceKeeper/releases/latest`
2. Download `PresenceKeeper-<version>-Setup.exe`
3. Run setup and launch the app

## Quick Start
1. Set interval in `Settings`
2. Click `Start` in dashboard
3. Optional: enable schedule and define `start` / `stop` time
4. Optional: enable auto-start with Windows login

## Update
- `Help -> Check for Updates`
- `Help -> Install Update and Restart`

## Development
```bash
cd C:\dev\PresenceKeeper
npm install
npm run dev
```

## Build Installer
```bash
npm run dist
```

Installer artifacts are generated in `dist\`.

## Tech Stack
- Electron
- PowerShell worker process
- Tailwind CSS
- Lucide icon set
- electron-updater
- electron-builder (NSIS)

## Project Structure
- `src/main.js` Electron main process, tray/menu, updater, scheduler
- `src/preload.js` secure IPC bridge
- `src/renderer/*` UI
- `worker/presence_worker.ps1` background worker script
- `CHANGELOG.md` release notes
- `ROADMAP.md` milestones

## Developer
- Landolsi Webdesign
- Email: info@landolsi.de
- Website: https://landolsi.de

## Security
- Dependabot: `.github/dependabot.yml`
- Security policy: `SECURITY.md`

## Versioning
Semantic Versioning (`MAJOR.MINOR.PATCH`)

## License
MIT

