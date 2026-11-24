# FINORA — UI Foundation

Personal finance dashboard built with React, Vite, TypeScript and Recharts.

## Included in this phase
- Responsive desktop and mobile dashboard
- Light/dark theme toggle
- Income and expense overview cards
- Cash-flow chart
- Daily budget card
- Recent transaction list
- Add transaction modal (local demo state only)
- PWA manifest and service worker configuration

## Run locally
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## GitHub Pages
The Vite `base` is configured as `/finora/` for:
`https://chalidmudatsir.github.io/finora/`

Enable GitHub Pages from repository Settings after adding the GitHub Actions workflow in a later deployment step.

## Important
This is the UI foundation only. Transaction data currently lives in browser memory and resets on refresh. No authentication, Google Apps Script API, or spreadsheet integration is connected yet.
