# API Reference

Base URL: `/api` (proxied to the server in dev; same-origin in a combined deployment).

All request/response bodies are JSON. Authenticated endpoints require
`Authorization: Bearer <token>`.

## Auth

### `POST /api/auth/signup`
Body: `{ email, password (min 8 chars), displayName }`
→ `201 { token, user }` or `409` if the email is already registered.

### `POST /api/auth/login`
Body: `{ email, password }`
→ `200 { token, user }` or `401` on invalid credentials.

### `POST /api/auth/guest`
Body: `{ displayName? }` (optional)
→ `201 { token, user }`. Creates a fully-functional guest account with no
credentials, so the platform can be tried instantly.

### `GET /api/auth/me`
Requires auth. → `200 { user }`.

## Footprint

### `POST /api/footprint`
Requires auth. Body: a `FootprintInput` (see `server/src/types/footprint.ts`
for the full shape — five sections: `transport`, `home`, `diet`,
`consumption`, `waste`).
→ `201 { entry, breakdown, persona, percentile }`.

### `GET /api/footprint/history`
Requires auth. → `200 { entries: FootprintEntry[] }`, oldest first.

### `GET /api/footprint/latest`
Requires auth. → `200 { entry, persona, percentile, trend }`. If the user has
no entries yet, `entry`/`persona`/`percentile` are `null` and `trend.available`
is `false`.

## Insights

### `GET /api/insights/recommendations`
Requires auth. Returns the rules-engine-ranked recommendation list for the
user's latest footprint entry, excluding any actions they've already
completed.
→ `200 { persona, recommendations }`, or a friendly `message` if no footprint
has been submitted yet.

## Actions

### `GET /api/actions/catalog`
Public (no auth). Returns the full static catalog of 21 recommendation
actions across all five categories.

### `POST /api/actions/complete`
Requires auth. Body: `{ actionId }`.
→ `201 { record, totalSavingsKg }`, or `404` if `actionId` doesn't exist in
the catalog.

### `GET /api/actions`
Requires auth. → `200 { completed: CompletedAction[], totalSavingsKg }`.

## Health

### `GET /api/health`
Public. → `200 { status: "ok", timestamp }`.

## Error shape

All errors follow `{ error: string }` (plus a `stack` field outside of
production, for local debugging). Validation errors return `400` with a
human-readable summary of every failing field.
