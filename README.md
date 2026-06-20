# 🌍 GreenTrack — Carbon Footprint Awareness Platform

Understand, track, and reduce your personal carbon footprint through a five-minute weekly check-in, ML-driven personalization, and a library of concrete, ranked actions.

Built for **Challenge 3: Carbon Footprint Awareness Platform**.

---

## Why this design

The challenge asks for three things: **understand**, **track**, and **reduce**. Every major feature maps directly to one of those verbs:

| Verb | Feature |
|---|---|
| **Understand** | A category-by-category breakdown (transport, home energy, diet, shopping, waste) computed from real, documented emission factors, plus a percentile comparison against a modeled population and an ML-detected "lifestyle persona" that explains *why* your footprint looks the way it does. |
| **Track** | A history of every weekly check-in, a trend chart, and a linear-regression-based 30-day projection once enough history exists. |
| **Reduce** | A ranked, personalized list of concrete actions (with estimated kg CO2e saved per week), a one-click "mark complete" flow, and a running tally of cumulative savings — i.e. gamified follow-through, not just a one-time score. |

---

## Personalization: rules + real ML

Per the project brief, this isn't just a calculator — it combines two complementary layers:

1. **A rules engine** (`server/src/services/rulesEngine.ts`) ranks a curated catalog of 21 actions by `(category's share of the user's footprint) × (estimated savings)`, then caps results per category so suggestions stay diverse instead of dogpiling one area.
2. **A from-scratch ML layer** (`server/src/services/mlInsights.ts`):
   - **K-means clustering** (`services/kmeans.ts`) groups a deterministic synthetic comparison population into lifestyle "personas" (commuter-heavy, home-energy-heavy, diet-heavy, etc.), and assigns each user to the nearest cluster centroid to explain *which* category dominates their footprint and why.
   - **Percentile scoring** compares a user's total against that same comparison population.
   - **Simple linear regression** (`services/linearRegression.ts`) fits a trend line across a user's tracked history and projects their footprint 30 days forward, with an R² check so a weak trend isn't presented as a confident prediction.

These are implemented from scratch rather than pulled from a heavy ML library, on purpose: the feature vectors are tiny (5 dimensions), and a transparent, dependency-free, fully-unit-tested implementation is both more efficient and more trustworthy than a black-box library for this scale of problem. See `docs/ARCHITECTURE.md` for the full reasoning.

---

## Quick start

Requires Node.js 18+ and npm.

```bash
git clone <your-repo-url>
cd carbon-footprint-platform
npm install          # installs both workspaces (server + client)

# Server
cp server/.env.example server/.env   # edit JWT_SECRET before deploying for real
npm run dev:server                   # http://localhost:4000

# Client (in a second terminal)
cp client/.env.example client/.env
npm run dev:client                   # http://localhost:5173 (proxies /api to :4000)
```

Open `http://localhost:5173`, click **Continue as guest**, and you're in — no signup required to try it.

### Tests, lint, build

```bash
npm test     # runs both workspaces: 57 server tests + 30 client tests, all passing
npm run lint # ESLint, zero warnings on both workspaces
npm run build # type-checks + builds both workspaces
```

---

## How this maps to the grading parameters

| Parameter | Where to look |
|---|---|
| **Code Quality** | Strict TypeScript (`strict: true`, `noUnusedLocals`, `noImplicitReturns`) across both workspaces. Layered server architecture (routes → controllers → services → models). Zero ESLint warnings. Zod schemas double as runtime validation *and* the single source of truth for TypeScript types. See `docs/ARCHITECTURE.md`. |
| **Security** | JWT auth with bcrypt password hashing, Helmet security headers, scoped CORS, two-tier rate limiting (general + stricter on auth routes), Zod input validation on every mutating endpoint, centralized error handling that never leaks stack traces in production, `npm audit` reports **0 vulnerabilities** in production dependencies. See `docs/SECURITY.md`. |
| **Efficiency** | Zero native-binary dependencies (no node-gyp/compiled modules — see the persistence-layer note in `docs/ARCHITECTURE.md`). O(1) in-memory lookups via `Map`. Route-level code-splitting on the client (`React.lazy`) plus manual vendor chunking, keeping the initial JS bundle to ~60KB gzipped while the chart library only loads on pages that need it. |
| **Testing** | **87 automated tests, all passing** (57 backend: unit + integration via Supertest against an in-memory store; 30 frontend: component + context tests via Vitest + React Testing Library). Backend coverage is ~98-100% on every service/controller/model file (`npm run test:coverage --workspace=server`). |
| **Accessibility** | Semantic landmarks, a skip-to-content link, visible focus rings, labeled form fields with `aria-describedby` hints, `<fieldset>`/`<legend>` grouping, charts exposed via `role="img"` with a full text summary *and* a `sr-only` data table fallback for screen readers, `prefers-reduced-motion` support, accessible progress bars with `aria-valuenow/min/max`. See `docs/ACCESSIBILITY.md`. |
| **Problem Statement Alignment** | See the "Why this design" table above — every feature traces back to understand/track/reduce, not just a generic CRUD app. |

---

## Project structure

```
carbon-footprint-platform/
├── server/                  # Express + TypeScript API
│   └── src/
│       ├── config/           # env loading, JSON-file data store
│       ├── controllers/      # request handlers
│       ├── data/             # emission factors + recommendation catalog
│       ├── middleware/       # auth, validation, rate limiting, errors
│       ├── models/           # typed data-access functions
│       ├── routes/           # Express routers
│       ├── services/         # calculator, rules engine, ML (kmeans/regression)
│       ├── types/            # Zod schemas + shared types
│       └── __tests__/        # Jest + Supertest, 57 tests
├── client/                   # React + TypeScript (Vite) SPA
│   └── src/
│       ├── components/       # forms, charts, cards (+ co-located tests)
│       ├── context/ hooks/   # auth state
│       ├── lib/               # typed fetch client
│       ├── pages/             # route-level views
│       └── types/
└── docs/                      # architecture, API reference, accessibility, security notes
```

## API reference

See `docs/API.md` for every endpoint, request/response shape, and auth requirements.

## License

MIT
