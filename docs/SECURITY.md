# Security

## Authentication & authorization
- Passwords are hashed with `bcryptjs` (10 salt rounds) — never stored or
  logged in plaintext.
- Sessions use signed JWTs (`jsonwebtoken`), with a configurable expiry
  (default 7 days). The signing secret is required via `JWT_SECRET` and the
  app **refuses to start in production** without it (`config/env.ts` throws
  rather than falling back to a default secret outside development).
- Guest accounts get full JWT-based sessions with zero credentials, so trying
  the product never requires handing over an email/password.
- Every mutating/private route runs through `requireAuth` middleware, which
  rejects missing/invalid/expired tokens with `401` before any controller
  logic runs.

## Input validation
- Every request body that reaches a controller has already been parsed and
  validated by a Zod schema (`validateBody` middleware). Invalid input never
  reaches business logic — it's rejected with `400` and a precise,
  field-level error message.
- Numeric inputs in `footprintInputSchema` are bounded (`.min(0).max(...)`)
  to realistic ranges, preventing both garbage data and trivial
  denial-of-service via absurdly large numbers feeding into calculations.

## Transport & headers
- `helmet()` sets standard protective headers (CSP, `X-Content-Type-Options`,
  HSTS, etc.) on every response.
- CORS is scoped to a single configured origin (`CORS_ORIGIN`), not `*`.
- Request bodies are capped at 100KB (`express.json({ limit: '100kb' })`) to
  blunt oversized-payload abuse.

## Rate limiting
- A general rate limiter applies to the whole API.
- Auth routes (`/signup`, `/login`, `/guest`) get a separate, stricter limiter
  to slow down credential-stuffing / brute-force attempts specifically.

## Error handling
- A centralized error handler (`middleware/error.middleware.ts`) ensures
  unhandled 500s never leak internal error messages or stack traces when
  `NODE_ENV=production` — the client only ever sees `"Internal server error"`.
- All async route handlers are wrapped (`utils/asyncHandler.ts`) so a
  rejected promise can never crash the process or hang a request without a
  response — every error path is funneled through the same centralized
  handler.

## Data storage
- No SQL is used anywhere in this codebase, which by construction eliminates
  SQL injection as an attack surface (see `docs/ARCHITECTURE.md` for why a
  JSON-file store was chosen over a SQL database).
- The on-disk data file is written via write-to-temp-then-atomic-rename, so a
  crash mid-write can never leave a corrupted, partially-written file that
  could be exploited or simply cause a denial of service on next boot.

## Dependency hygiene
- `npm audit --omit=dev` reports **0 vulnerabilities** in production
  dependencies (verified at submission time; dev-only tooling like
  `eslint`/`jest` may show advisories that never ship to runtime).

## What's intentionally out of scope for this submission
- HTTPS termination is assumed to be handled by the hosting platform (e.g. a
  reverse proxy / PaaS), not the Node process itself.
- CSRF protection is not implemented because the API is a pure JSON API
  consumed via `Authorization: Bearer` headers (not cookies), which is not a
  CSRF-vulnerable pattern.
