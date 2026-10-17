# Clinic Management System — Frontend

Next.js 16 frontend for the single-doctor clinic management system. Arabic RTL, server-first, tokens never in the browser.

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env.local
# Fill in: API_BASE_URL, COOKIE_SECRET (already set by the setup script)

# 3. Start dev server (requires backend running on :4000)
npm run dev
```

Frontend: http://localhost:3000

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server on :3000 |
| `npm run build` | Production build |
| `npm run type-check` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run api:types` | Regenerate OpenAPI types from backend |
| `npx playwright test` | Run smoke tests (requires full stack) |

---

## Architecture

```
src/
├── app/                   # Next.js App Router pages
│   ├── login/             # Login page (public)
│   ├── reception/         # RECEPTION role pages
│   ├── doctor/            # DOCTOR role pages
│   ├── admin/             # ADMIN role pages
│   └── api/               # Route Handlers (ticket, logout, attachments)
├── components/
│   ├── ui/                # shadcn-style primitives (Button, Input, etc.)
│   └── shell/             # App shell (sidebar, status badge)
├── features/              # Feature modules (queries + server actions)
├── hooks/                 # Client-side hooks (useQueueRealtime)
├── lib/
│   ├── api/client.ts      # Server-only API client (reads httpOnly cookies)
│   ├── session.ts         # Session helpers (server-only)
│   └── utils.ts           # Date / money / Arabic helpers
├── messages/ar.ts         # ALL Arabic UI strings (single dictionary)
└── proxy.ts               # Auth check utility (called from layouts)
```

---

## Auth Design

1. Login → Server Action → `POST /auth/login` → sets httpOnly cookies (`access_token`, `refresh_token`, `session_user`)
2. Every Server Component / Server Action reads the cookie server-side. **The browser never sees the JWT.**
3. On 401, the API client automatically tries one token refresh before failing.
4. Socket.IO: browser calls `/api/realtime/ticket` Route Handler → server calls `POST /auth/socket-ticket` → browser connects with one-time ticket. Ticket expires in 30 s, single-use.
5. Logout → Route Handler clears cookies.

---

## Realtime Design

```
Browser                  Next.js server        NestJS backend
  |                           |                      |
  |--- GET /api/realtime/ticket -->                   |
  |                    POST /auth/socket-ticket ----->|
  |                    <-- { ticket } ---------------|
  |<-- { ticket } ------------|                       |
  |--- io.connect({ auth: { ticket } }) ------------>|
  |                                         consumes ticket
  |<--- queue.updated, appointment.completed --------|
```

If disconnected: polls every 5 s via `router.refresh()`, reconnects on window focus.

---

## Caching Strategy

All authenticated pages use `export const dynamic = 'force-dynamic'` — clinic data is private and changes frequently. No shared cache entries across users. After mutations, `revalidatePath()` is called for affected routes.

---

## Environment Variables

| Variable | Visibility | Purpose |
|---|---|---|
| `API_BASE_URL` | Server-only | Backend URL for server-side fetch |
| `COOKIE_SECRET` | Server-only | Cookie signing |
| `NEXT_PUBLIC_SOCKET_URL` | Browser | Socket.IO connection URL |

---

## Running Playwright Smoke Tests

```bash
# Set credentials (from server/.env after seeding)
export E2E_ADMIN_USERNAME=admin
export E2E_ADMIN_PASSWORD=<read from server/.env>
export E2E_DOCTOR_USERNAME=doctor
export E2E_DOCTOR_PASSWORD=<read from server/.env>
export E2E_RECEPTION_USERNAME=reception
export E2E_RECEPTION_PASSWORD=<read from server/.env>

# Run tests (starts dev server automatically)
npx playwright test
```
