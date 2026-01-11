# LetsGoDutch

Privacy-first, peer-to-peer expense sharing app.

## Features

- **Receipt Scanning** - On-device OCR, your images never leave your phone
- **Smart Splits** - Equal, percentage, by-item, and more
- **Multi-Currency** - Real-time rates, works offline
- **P2P Sync** - No central server, sync directly with friends
- **Always Free** - No premium tiers, open source forever

## Tech Stack

- **Framework**: SvelteKit 2 + TypeScript
- **UI**: Tailwind CSS + Skeleton UI
- **Database**: IndexedDB via Dexie.js
- **Sync**: Yjs + y-webrtc (P2P CRDT)
- **OCR**: Tesseract.js (on-device)
- **PWA**: Vite PWA + Workbox

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

```bash
# Type checking
npm run check

# Linting
npm run lint

# Format code
npm run format
```

## Project Structure

```
src/
├── lib/
│   ├── components/   # Svelte components
│   ├── db/           # Dexie database layer
│   ├── sync/         # P2P sync with Yjs
│   ├── ocr/          # Receipt scanning
│   ├── calc/         # Balance calculations
│   ├── currency/     # Exchange rates
│   └── types/        # TypeScript types
├── routes/           # SvelteKit pages
└── app.css           # Global styles
```

## Privacy

- All data stored locally in IndexedDB
- OCR runs entirely on-device
- P2P sync uses WebRTC (no server stores your data)
- Invite links use URL fragments (keys never sent to server)

## License

AGPL-3.0 - See [LICENSE](LICENSE) for details.

---

Built with privacy in mind.
