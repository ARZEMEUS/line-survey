# Line Survey MVP

Internal/offline-first React + TypeScript + Vite prototype.

## Run in VS Code
1. Install Node.js LTS.
2. Open this folder in VS Code.
3. Open Terminal.
4. Run `npm install`.
5. Run `npm run dev`.
6. Open the displayed local URL. For phone testing on the same Wi-Fi, use the URL with the PC's LAN IP.

## Build for internal deployment
`npm run build`

Serve the `dist` folder with IIS, Nginx, Caddy, or a simple internal web server.

## Important Life of Way formula in this MVP
- X1 = 2 - 1
- X2 = 3 - 2 - 1
- X3 = 4 - 3 - 2 - 1
- X4 = 4

The four inputs are stored separately, and X1-X4 are stored with each distance row.

## Data
IndexedDB via Dexie is used for local/offline storage.

## Export
Excel export creates four sheets: `Survey Data`, `Life of Way`, `Block Master`, and `Excel Layout`.
