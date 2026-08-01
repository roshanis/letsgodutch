// Disable SSR for full client-side SPA (required for P2P/IndexedDB)
// Prerendering is off because dynamic routes (/group/[id], /join/[groupId])
// are served via the adapter-static index.html fallback.
export const ssr = false;
export const prerender = false;
