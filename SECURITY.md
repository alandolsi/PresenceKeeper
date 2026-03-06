# Security Policy

## Dependency Security Baseline
- `npm audit` must report `0` high/critical vulnerabilities on `main`.
- Moderate vulnerabilities must be reviewed and either fixed or explicitly documented.
- Dependency updates should be handled via pull requests with CI checks.

## Update Process
1. Run:
```bash
npm install
npm audit
```
2. Apply safe updates:
```bash
npm audit fix
```
3. For remaining findings, evaluate impact and compatibility before any forced upgrade.

## Responsible Disclosure
If you discover a security issue in PresenceKeeper, contact:
- Landolsi Webdesign <info@landolsi.de>
- https://landolsi.de
