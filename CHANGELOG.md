# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog.
This project adheres to Semantic Versioning.

## [Unreleased]

## [0.2.9] - 2026-03-09
### Fixed
- Restored circular Start/Stop button rendering by reattaching the shared `orb-btn` base class in the renderer markup.

## [0.2.8] - 2026-03-09
### Fixed
- Restored Start/Stop orb button styling to match the previous visual design after the Tailwind v4 migration.

## [0.2.7] - 2026-03-09
### Changed
- Migrated renderer styling pipeline from Tailwind CSS v3 to Tailwind CSS v4.
- Switched CSS build command to the Tailwind v4 CLI entrypoint.
- Reworked custom component styles in `tailwind.input.css` to remove v3-only `@apply` patterns.

## [0.2.6] - 2026-03-09
### Added
- Language switching with dedicated options for English, German, and French.

### Changed
- Localized the full renderer UI for EN/DE/FR.
- Localized tray menu and Help menu labels for EN/DE/FR.
- Removed the version line under the UI subtitle (version remains visible under `Help`).

## [0.2.5] - 2026-03-09
### Changed
- Moved `Interval (seconds)` input from Dashboard to `Einstellungen` for cleaner runtime view.

## [0.2.4] - 2026-03-09
### Changed
- Moved schedule controls into a dedicated `Einstellungen` tab.
- Removed the in-app `App Updates` panel from the dashboard; update actions remain in `Help`.
- Added app version display in UI header and in the `Help` menu.
- Log panel is now hidden by default and can be toggled via `Logs anzeigen`.

### Fixed
- Removed noisy startup line `Application initialized.` from session log output.
- Suppressed PowerShell banner lines in worker log output.

## [0.2.3] - 2026-03-09
### Fixed
- Packaged PowerShell worker path resolution by loading from `app.asar.unpacked` in installed builds.

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
