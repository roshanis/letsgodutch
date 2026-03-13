# LetsGoDutch

LetsGoDutch is a privacy-first expense sharing app for trips, roommates, and small groups. The goal is to keep the convenience of Splitwise-style tracking while pushing more data handling onto the device and reducing reliance on a central service.

## Product direction

- Receipt scanning with on-device OCR
- Flexible split types for real-world group expenses
- Multi-currency support with offline-friendly behavior
- Local-first storage with peer-to-peer collaboration
- Open source and free to use

## Tech stack

- SvelteKit 2 and TypeScript
- Tailwind CSS and Skeleton UI
- IndexedDB via Dexie
- Yjs-based sync
- Tesseract.js for OCR
- Vite PWA tooling

## Local development

```bash
npm install
npm run dev
```

Open the local dev server URL shown by Vite.

## Common commands

```bash
npm run build
npm run preview
npm run check
npm run lint
npm run format
npm test
npm run test:e2e
```

## Repository layout

- `src/lib/components`: UI building blocks
- `src/lib/db`: local persistence
- `src/lib/ocr`: receipt processing
- `src/lib/sync`: collaboration and sync primitives
- `src/lib/calc`: split and balance calculations
- `src/lib/currency`: exchange-rate logic
- `src/routes`: SvelteKit routes and screens

## Privacy model

- Data is stored locally in the browser
- OCR runs on-device
- Sync is designed around direct collaboration rather than a permanent central backend
- Secret material for invites can stay out of normal server logs

## Status

Current status: active product prototype under development.

## License

AGPL-3.0. See [LICENSE](LICENSE).
