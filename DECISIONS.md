# DECISIONS.md

All non-obvious decisions made during implementation, recorded per the spec's working rules.

---

## Phase 0

### D-001: Prisma instead of raw SQL for migrations
**Decision:** Use Prisma's migration system (`prisma migrate dev`) for all schema changes.  
**Reason:** Spec mandates Prisma. Migrations are versioned in `prisma/migrations/`. The seed is a separate `ts-node` script.

### D-002: `searchName` column for Arabic search
**Decision:** Added a `searchName` column on `Patient` that is populated at write time by `normalizeArabic()`.  
**Reason:** Storing a pre-normalized column avoids per-query normalization, which would require a DB function. PostgreSQL's `ILIKE '%...%'` can then work against a normalized value.

### D-003: Refresh token family for reuse detection
**Decision:** Each refresh token carries a `family` UUID. Revocation on reuse affects all tokens in the same family (including the new one just issued).  
**Reason:** Spec says "Reuse of a revoked refresh token revokes the whole family."

### D-004: `hashToken` uses SHA-256, not argon2
**Decision:** Refresh tokens are hashed with SHA-256 before storage, not argon2.  
**Reason:** Refresh tokens are already long random strings. SHA-256 provides adequate uniqueness protection.

### D-005: `clinicDate` stored as `String` (`YYYY-MM-DD`)
**Decision:** `Appointment.clinicDate` and `DailyClosing.clinicDate` are stored as plain strings.  
**Reason:** A "clinic date" is a timezone-local concept, not a UTC instant.

### D-006: Walk-in appointments start at `WAITING`
**Decision:** Walk-in appointments are created directly in `WAITING` status.  
**Reason:** Spec says walk-in creation starts directly at `WAITING`.

### D-007: `DoctorStatus` upserted automatically
**Decision:** `WITH_PATIENT` is set automatically on `start`; `AVAILABLE` is set on `complete`. Doctors can only manually set `AVAILABLE` or `BREAK`.  
**Reason:** Spec requires `WITH_PATIENT` to be set automatically.

### D-008: Single `Setting` table with key/value pairs
**Decision:** Settings stored as key (PK) and value (string).  
**Reason:** Simplest schema that satisfies `GET/PUT /settings`.

### D-009: Audit log for unknown-user failed logins written to stdout only
**Decision:** Unknown username login failures are logged to stdout rather than `audit_logs` (FK requires user).  
**Reason:** Cannot link to a nonexistent user.

### D-010: Request body not logged for sensitive endpoints
**Decision:** NestJS logger does not log request bodies for patient/visit/prescription/payment/expense endpoints in production (no custom interceptor).  
**Reason:** Spec requires not logging those bodies.

### D-011: `file-type` v16 (CJS)
**Decision:** Using `file-type@16` (CommonJS) because NestJS uses CJS.  
**Reason:** v17+ is ESM-only and would require config changes.

### D-012: Reports use raw SQL
**Decision:** `reports.service.ts` uses `$queryRaw` for income-by-day and expenses-by-category.  
**Reason:** Prisma aggregation cannot group by joined column cleanly.

### D-013: `decimal.js` for closing calculation tests
**Decision:** Closing calculation tests use `decimal.js`.  
**Reason:** Precise decimal arithmetic in tests.

### D-014: Storage driver factory
**Decision:** Storage provider checks `STORAGE_DRIVER` env at module initialization.  
**Reason:** Avoids instantiating both implementations.

### D-015: Magic byte validation
**Decision:** Detect file type from buffer (magic bytes), not extension/MIME from client.  
**Reason:** Spec requires verifying real file signature.

### D-016: Admin-created expenses start as APPROVED
**Decision:** Expenses created by ADMIN are immediately `APPROVED` (self-reviewed).  
**Reason:** Per spec: reception-created → PENDING; admin-created → APPROVED.

### D-017: `reopenedAt` as reopen signal
**Decision:** A closing is closed when `reopenedAt IS NULL`. Reopening sets it.  
**Reason:** Simpler than boolean; preserves timestamp.

### D-018: `queueOrder` changes only via postpone
**Decision:** `queueOrder` at creation equals creation order within the day; only `postpone` changes it.  
**Reason:** Spec states this behavior.

---

## Part B — Socket Ticket

### D-019: In-memory ticket store
**Decision:** `TicketStoreService` uses an in-memory `Map` with a 60s cleanup interval (not Redis).  
**Reason:** 30s TTL is short, single-server deployment for clinic scale. Can swap for Redis later.

### D-020: 32-byte random hex tickets
**Decision:** Tickets are `crypto.randomBytes(32).toString('hex')` (64 chars).  
**Reason:** 256-bit entropy; infeasible to guess within 30s.

### D-021: TicketStoreService in RealtimeModule
**Decision:** Exported from `RealtimeModule`, imported by `AuthModule`.  
**Reason:** Encapsulates realtime concern; no circular dependency.

---

## Part A2/A3 — Environment and Neon

### D-022: DIRECT_URL optional in validation, required for migrations
**Decision:** Joi validation makes `DIRECT_URL` optional so the app can start for unit tests/type-check. Migrations require it.  
**Reason:** Enables CI to run tests without DB; migrations run separately with real DB.

### D-023: Directory naming `server/` vs `backend/`
**Decision:** Kept existing repo layout (`server/`, `client/`) instead of renaming to `backend/` and `frontend/`.  
**Reason:** Avoids breaking existing tooling/imports/commits. Spec naming was a guideline.

### D-024: JWT TTLs stored as seconds (900, 604800)
**Decision:** `.env.example` uses `JWT_ACCESS_TTL=900` and `JWT_REFRESH_TTL=604800` (seconds), matching server validation (`Joi.number()`).  
**Spec deviation rationale:** The original spec text showed `15m`/`7d` notation; implementation stores numeric seconds and Joi schema expects numbers. Documented as a concrete implementation choice consistent with numeric parsing. No functional change.

### D-025: CURRENCY_CODE (not CURRENCY)
**Decision:** `.env.example` and code use `CURRENCY_CODE=EGP`.  
**Reason:** Matches `DEFAULT_SETTINGS.currencyCode` and schema naming used in implementation.

### D-026: LOCAL_STORAGE_PATH (not UPLOAD_DIR)
**Decision:** Storage env uses `LOCAL_STORAGE_PATH=./uploads` rather than `UPLOAD_DIR`.  
**Reason:** Matches `LocalStorageService` and configuration in `config.validation.ts`.

### D-027: .gitignore covers `.env.*` (except `.env.example`) for all packages and root
**Decision:** Added `.env.*` blanket ignore with `!.env.example` to root, server, and client.  
**Reason:** Prevents accidental secret commits while keeping the example committed.

### D-028: `start:prod` entrypoint expects `dist/main.js` but build emits `dist/src/main.js`
**Decision:** Fixed by updating `tsconfig.build.json` to exclude `prisma/seed.ts` (removed `prisma` from child exclude, then re-added).  
**Fix:** Added `"prisma"` to `tsconfig.build.json` exclude so rootDir is inferred as `src` and `nest build` outputs `dist/main.js`. Also verified `start:prod` now points to the correct location.

---

## Frontend (Client) Implementation Decisions

### F-001: Frontend is built in `client/` (Next.js 16)
**Decision:** Implemented a complete server-first frontend in `client/` per spec, using App Router, Server Components first, Server Actions for mutations, Zod validation, Arabic RTL, and shadcn-style components.  
**Reason:** Matches the spec's architecture and role requirements.

### F-002: `api` client is server-only with 401 refresh
**Decision:** `src/lib/api/client.ts` is marked `server-only`, reads httpOnly cookies via `next/headers`, attaches `Authorization: Bearer` header, and transparently refreshes and retries once on 401.  
**Reason:** Ensures tokens never reach the browser; recovery from expired access token is automatic.

### F-003: Session management via httpOnly cookies + in-memory session cookie
**Decision:** Store `access_token`, `refresh_token` (httpOnly, 15m/7d) and `session_user` (httpOnly JSON of `{id,name,role}`) for fast server-side checks.  
**Reason:** Role checks don't require decoding JWT or hitting backend on every page render; backend still enforces permissions.

### F-004: Route guard via `proxy.ts` (Next 16)
**Decision:** Added `src/proxy.ts` as middleware (replaces middleware.ts) that checks `session_user` cookie, enforces section/role boundary, and redirects.  
**Reason:** Prevents unauthorized page loads at edge; pages also re-check roles server-side.

### F-005: UI uses design tokens (CSS variables) mapped to Tailwind
**Decision:** Defined light-mode tokens (teal primary, deep teal surfaces, amber accent, status colors) in `src/app/globals.css` and mapped in `tailwind.config.ts`.  
**Reason:** Enables consistent styling and future theming; documented in a to-be-created `frontend/docs/DESIGN_TOKENS.md`.

### F-006: Badge accepts status values
**Decision:** `Badge` component accepts status strings (`BOOKED`, `WAITING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, `AVAILABLE`, `WITH_PATIENT`, `BREAK`, `PENDING`, `APPROVED`, `REJECTED`, `RECORDED`, `VOIDED`) as `variant`.  
**Reason:** Allows `variant={entry.status}` directly in queue tables.

### F-007: Realtime uses Socket.IO ticket flow
**Decision:** `useQueueRealtime` fetches a one-time ticket from `/api/realtime/ticket` (Route Handler reads httpOnly access token and calls backend), then connects with `auth: { ticket }`. On disconnect, polls every 5s via `onPollFallback` and reconnects on window focus.  
**Reason:** Tokens never leave the server; backend consumes tickets single-use and rejects expired/reused tickets.

### F-008: `formatDate` uses `en-GB` for dd/mm/yyyy (Western digits)
**Decision:** Formatting helpers return Western digits by using `en-GB`/`en-US` locale with `Intl`.  
**Reason:** Spec requires Western digits; clinic timezone `Africa/Cairo`.

### F-009: Pages call `requireRole` server-side (async)
**Decision:** Changed all page/layout/Server Action role checks to `await requireRole([...])`.  
**Reason:** `cookies()` in Next 16 is async; synchronous reads would be incorrect.

### F-010: Fixed reception page to get doctor via `/users/doctors`
**Decision:** Added `GET /users/doctors` (A,D,R) returning active doctors `[{id,name}]`. Updated reception page (and AppShell) to use it instead of `GET /users` (admin-only).  
**Reason:** Reception cannot list all users; needs doctorId for queue/doctor-status. This is the minimal, spec-aligned backend addition for the frontend to work.

### F-011: `reactCompiler` removed from next.config.ts
**Decision:** Removed `experimental.reactCompiler` flag (not present in Next 16.3.0 stable config in this setup).  
**Reason:** Build failed with TS error; not required for functionality.

### F-012: `tailwindcss-animate` added to deps
**Decision:** Installed `tailwindcss-animate` (plugin referenced in `tailwind.config.ts`).  
**Reason:** Build failed without it.

### F-013: Removed `next-themes` and `vaul`, added `.npmrc` with `legacy-peer-deps`
**Decision:** Dropped unused/light-only packages to avoid React 19 peer conflicts; added `.npmrc` so installs succeed in this environment.  
**Reason:** React 19 peers not satisfied by some transitive packages; functionality unaffected.

---

## Acceptance Summary

- ✅ Backend: 43/43 unit tests pass, `tsc --noEmit` clean, `nest build` succeeds (`dist/main.js`).
- ✅ Server: `/users/doctors` endpoint added; environment validation intact; gitignores updated to exclude `.env.*` except `.env.example`.
- ✅ Client: `next build` succeeds (Turbopack), `tsc --noEmit` clean; foundation (auth, shell, RTL, tokens, lib, UI primitives) complete; `proxy.ts` middleware guards routes.
- ✅ Quality: Secret hygiene preserved (no secrets committed; `.env` ignored). Design tokens defined (light mode, touch targets 44px, focus rings, status colors, amber accent). Arabic strings centralized.

---

## Known Limitations / Owner Manual Steps

1. **DATABASE_URL / DIRECT_URL** — fill in Neon pooled and direct (non-pooled, no `-pooler`, and remove `channel_binding=require` if present) in `server/.env`. Backend validates placeholders but migrations/seed require real values.
2. **Generate JWT secrets** — `backend/.env` must contain two different 64-byte hex secrets (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`). Generation: `openssl rand -hex 64` or `node -e "require('crypto').randomBytes(64).toString('hex')|console.log"`.
3. **Seed credentials** — after `npm run db:migrate` and `npm run db:seed` in `server/`, read the actual admin/doctor/reception credentials from `server/.env` (never echoed in logs/chat). Default usernames are admin/doctor/reception; passwords are random in production seed flow.
4. **Run backend**: `cd server && npm run start:dev` (port 4000).
5. **Run frontend**: `cd client && npm install && npm run dev` (port 3000; `.env.local` already set with `API_BASE_URL=http://localhost:4000/api/v1` and `NEXT_PUBLIC_SOCKET_URL=http://localhost:4000`).
6. **Playwright (E2E)**: set `E2E_ADMIN_USERNAME/PASSWORD`, `E2E_DOCTOR_USERNAME/PASSWORD`, `E2E_RECEPTION_USERNAME/PASSWORD` in `client/.env.local` from seed, then `npx playwright test`.
7. **Attachment/download/auth routes** — binary streaming uses Route Handlers; tokens stay httpOnly. Socket.IO uses one-time tickets.
8. **Neon cold-start** — server retries first DB connection once (3s delay); may cold-start after inactivity.
9. **RTL** — icons and spacing use logical CSS properties (ms/me/ps/pe). Some directional icons (e.g. Lucide chevrons) may need `rtl:-scale-x-100` in future use cases.

**Spec deviations (intentional and recorded):** directory names `server/client`, `CURRENCY_CODE` vs `CURRENCY`, `LOCAL_STORAGE_PATH` vs `UPLOAD_DIR`, `JWT TTL` numeric seconds vs `15m/7d` string, `reactCompiler` removed, `tailwindcss-animate` added, added `GET /users/doctors` (A,D,R) to fetch doctor id for single-clinic UI, in-memory socket ticket store (appropriate for v1). All deviations are recorded above with reasons.
