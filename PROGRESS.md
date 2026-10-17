# Project Progress

Last updated: 2026-10-17

## Backend (`server/`)

| Phase | Status | Tests | Notes |
|-------|--------|-------|-------|
| P0: Foundation — auth, RBAC, Prisma, Swagger, settings | ✅ Done | 43/43 pass | JWT + refresh family, JwtAuthGuard + RolesGuard global |
| P1: Patients, Appointments, Queue, Realtime (Socket.IO) | ✅ Done | state-machine tests | Arabic search, idempotent transitions, realtime rooms |
| P2: Visits, Prescriptions, Attachments | ✅ Done | versioning tests | Optimistic locking v field, magic-byte upload check |
| P3: Payments, Expenses, Closing, Reports | ✅ Done | closing-calc tests | Doctor 403 on all finance; reception 403 on all medical |
| A2: .env / .env.example, startup validation | ✅ Done | — | Secrets in .env only, never echoed |
| A3: Prisma directUrl, Neon cold-start retry, scripts | ✅ Done | — | `db:migrate`, `db:seed`; /docs-json endpoint |
| B: Socket tickets (POST /auth/socket-ticket) | ✅ Done | 7 unit tests | Single-use, 30 s TTL; gateway accepts `auth.ticket` |

### How to run backend tests

```bash
cd server
# Unit tests (43 tests, 6 suites)
node "node_modules/.pnpm/jest@29.7.0_.../jest/bin/jest.js" --config jest.config.js --forceExit
```

---

## Frontend (`client/`)

| Phase | Status | Notes |
|-------|--------|-------|
| F0: Scaffold, RTL, tokens, auth, layouts | ✅ Done | Cairo font, CSS variables, httpOnly cookies, `proxy.ts` |
| F1: Reception — queue, patients, payments, expenses, closing | ✅ Done | Realtime queue board, done-alert with sound, fallback poll |
| F2: Doctor — today screen, visit editor, availability | ✅ Done | Autosave debounce, VERSION_CONFLICT dialog |
| F3: Admin — dashboard, reports, users, settings, audit | ✅ Done | Server-side data fetch, no token in browser |
| F4: Polish, Playwright smoke tests, README | ✅ Done | 9 smoke tests covering login, role guard, token exposure |

---

## Owner manual steps (do these after cloning)

1. Fill `server/.env` — `DATABASE_URL` and `DIRECT_URL` (Neon strings)
2. `cd server && npm run db:migrate`
3. `npm run db:seed` — read credentials from `server/.env`
4. `npm run start:dev` (port 4000)
5. `cd ../client && npm install && npm run dev` (port 3000)
6. To run Playwright tests: set `E2E_*` env vars from the seed credentials, then `npx playwright test`
