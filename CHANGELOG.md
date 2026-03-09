# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.
This project adheres to Semantic Versioning.

## [Unreleased]

## [0.2.2] - 2026-03-09
### Fixed
- Release/version consistency improvements for installer artifacts and GitHub tagging.

### Added
- TailwindCSS build pipeline for renderer styling.
- Modernized control-center UI with round Start/Stop buttons.
- GitHub release workflow for tagged installer publishing.
- System tray mode with Open/Start/Stop/Exit actions.
- Windows auto-start toggle in UI using Electron login item settings.

### Changed
- Replaced legacy renderer stylesheet with Tailwind-based styles.
- Improved Electron builder metadata for production publishing.
- Closing the window now hides the app to tray instead of exiting.

## [0.1.0] - 2026-03-06
### Added
- Initial Electron project structure.
- PowerShell worker for periodic activity trigger.
- Start/stop controls and interval support.
- Countdown UI and schedule controls.
- Repository docs: README, ROADMAP, LICENSE.
