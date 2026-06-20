# GreenTrack client

React + TypeScript SPA for the Carbon Footprint Awareness Platform. See the
[root README](../README.md) for the full project overview, and `docs/` for
architecture, API, accessibility, and security notes.

## Scripts

```bash
npm run dev          # Vite dev server on :5173, proxies /api to :4000
npm run build         # tsc -b && vite build
npm run test           # Vitest (component + context tests)
npm run lint            # ESLint
```

## Structure

- `src/components/` — reusable UI (forms, charts, cards), each with a
  co-located test in `__tests__/`.
- `src/pages/` — route-level views (Auth, Dashboard, Track, History, Actions).
- `src/context/` + `src/hooks/` — auth session state.
- `src/lib/api.ts` — typed fetch client for the backend.
- `src/types/` — shared TypeScript types mirroring the API contract.
