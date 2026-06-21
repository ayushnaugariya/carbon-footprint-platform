# 🌍 GreenTrack — Carbon Footprint Awareness Platform

GreenTrack is a premium web application designed to help individuals understand, track, and reduce their personal carbon footprint through dynamic calculations, ML-driven personalization, and a curated library of concrete, actionable habits.

---

## Key Features

The platform follows a three-step cycle to encourage real, sustainable habits:

1. **Understand**:
   - A step-by-step 5-category calculator wizard (Transport, Home Energy, Diet, Shopping, Waste) computed using real, documented emission factors, with real-time live carbon estimation feedback.
   - Comparison against average population percentiles and clustering into a lifestyle "persona" (e.g., commuter-heavy, diet-heavy) to explain *why* your footprint looks the way it does.
   - Interactive Landing Page: features a live community Saved CO2 odometer counter, an interactive Climate Action Quiz, and dynamic Carbon Offset equivalents (visualizing tons in terms of trees, homes, and flights).
2. **Track**:
   - Save historical footprint check-ins to monitor progress over time.
   - Visualize weekly data and category breakdowns using responsive, gradient-filled charts.
   - Automatically project emissions 30 days forward using linear regression trends once sufficient history is built.
3. **Reduce**:
   - A ranked, personalized library of carbon-reducing actions tailored specifically to your footprint areas.
   - Interactive Carbon Goal Tracker: set percentage reduction targets (10% to 50%) via range sliders and watch your completed action savings accumulate toward your goals.
   - Interactive progress bars, one-click completions, and a running tally of cumulative savings to gamify and encourage long-term follow-through.

---

## Tech Stack & Architecture

- **Frontend**: React 19 (TypeScript), Vite, Tailwind CSS v4, Recharts (for data visualization), React Router 6.
- **Backend**: Node.js, Express, TypeScript, Zod (runtime validation and type definition).
- **Security & Efficiency**: Scoped CORS policies, Helmet headers, two-tier rate limiting, bcrypt password hashing, and lightweight, dependency-free local JSON persistence.
- **ML Services**: Custom, dependency-free mathematical services built from scratch:
  - **K-Means Clustering**: Clusters users into distinct lifestyle personas using spatial centroids.
  - **Linear Regression**: Fits historical check-ins to project carbon savings trends and evaluate data fit ($R^2$ check).

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm installed.

### Setup and Running Locally

1. **Clone the repository and install dependencies**:
   ```bash
   git clone https://github.com/ayushnaugariya/carbon-footprint-platform.git
   cd carbon-footprint-platform
   npm install
   ```

2. **Configure and run the Backend API**:
   ```bash
   cp server/.env.example server/.env
   # Open server/.env and edit JWT_SECRET with a secure value
   npm run dev:server
   # Server starts on http://localhost:4001
   ```

3. **Configure and run the Client Frontend** (in a separate terminal):
   ```bash
   cp client/.env.example client/.env
   npm run dev:client
   # Frontend starts on http://localhost:5173 (proxies /api to port 4001)
   ```

Open `http://localhost:5173` in your browser. You can click **Try instantly as Guest** or create an account to start tracking!

---

## Quality & Standards

- **Code Quality**: Strict TypeScript configuration (`strict: true`, type-safe JSON payloads, clean modular layer structure: routes → controllers → services → models). Zero ESLint warnings.
- **Security**: Centralized error boundaries, JWT auth, input validation on every mutating endpoint, and zero production vulnerabilities.
- **Accessibility**: Semantic HTML5 landmarks, visible focus indicators, screen-reader-only summary tables for charts, `prefers-reduced-motion` animation support, and accessible ARIA attributes.
- **Tests**: **124 automated tests** (70 backend integration tests via Jest + Supertest; 54 frontend component tests via Vitest + React Testing Library).

---

## Directory Structure

```
carbon-footprint-platform/
├── server/                  # Express + TypeScript API
│   └── src/
│       ├── config/           # env loading, JSON-file database
│       ├── controllers/      # request handlers
│       ├── data/             # emission factors + recommendations catalog
│       ├── middleware/       # auth, validation, rate limiting, errors
│       ├── models/           # typed data-access layers
│       ├── routes/           # Express router configs
│       ├── services/         # calculator, rules engine, ML (kmeans/regression)
│       └── __tests__/        # Jest + Supertest integration tests
├── client/                   # React + TypeScript (Vite) Frontend
│   └── src/
│       ├── components/       # wizard form steps, charts, layout (+ tests)
│       ├── context/ hooks/   # auth states and helper hooks
│       ├── lib/               # fetch client
│       └── pages/             # route views (Home, Dashboard, Track, History, Actions)
└── docs/                      # architecture, API, and accessibility documentation
```

## License

MIT
