# DECISIONS.md

All non-obvious decisions made during implementation, recorded per the spec's working rules.

---

## Phase 0

### D-001: Prisma instead of raw SQL for migrations
**Decision:** Use Prisma's migration system (`prisma migrate dev`) for all schema changes.  
**Reason:** Spec mandates Prisma. Migrations are versioned in `prisma/migrations/`. The seed is a separate `ts-node` script.

### D-002: `searchName` column for Arabic search
**Decision:** Added a `searchName` column on `Patient` that is populated at write time by `normalizeArabic()`.  
**Reason:** Storing a pre-normalized column avoids per-query normalization, which would require a DB function. PostgreSQL's `ILIKE '%...%'` can then work against a normalized value. A GIN trigram index (`pg_trgm`) can be added in a later migration for full performance; the column structure supports it without schema changes.  
**Spec reference:** Section 9 — "normalize alef variants … for both stored search columns and queries. Keep a normalized `searchName` column on `Patient`."

### D-003: Refresh token family for reuse detection
**Decision:** Each refresh token carries a `family` UUID. Revocation on reuse affects all tokens in the same family (including the new one just issued).  
**Reason:** Spec says "Reuse of a revoked refresh token revokes the whole family." The family is seeded with a new UUID on first login and carried forward on each rotation.

### D-004: `hashToken` uses SHA-256, not argon2
**Decision:** Refresh tokens are hashed with SHA-256 before storage, not argon2.  
**Reason:** Refresh tokens are already long random strings (40 bytes of `crypto.randomBytes`). SHA-256 provides adequate uniqueness protection without the computational cost of argon2. Passwords use argon2 as mandated.

### D-005: `clinicDate` stored as `String` (`YYYY-MM-DD`), not `DateTime`
**Decision:** `Appointment.clinicDate` and `DailyClosing.clinicDate` are stored as plain strings.  
**Reason:** A "clinic date" is a timezone-local concept, not a UTC instant. Storing it as a string avoids time-zone conversion bugs when reading back the value. The string format `YYYY-MM-DD` is unambiguous.

### D-006: Walk-in appointments start at `WAITING`, not `BOOKED`
**Decision:** Walk-in appointments are created directly in `WAITING` status.  
**Reason:** Spec says "Walk-in creation starts directly at `WAITING`." The `arrivedAt` field is set to `now()` on creation.

### D-007: `DoctorStatus` upserted on appointment transitions
**Decision:** `WITH_PATIENT` is set automatically on `start`; `AVAILABLE` is set on `complete`. The doctor can only manually set `AVAILABLE` or `BREAK` (never `WITH_PATIENT`).  
**Reason:** Spec says "WITH_PATIENT is set automatically." The doctor's `PUT /doctor-status` DTO only accepts `AVAILABLE | BREAK`.

### D-008: Single `Setting` table with key/value pairs
**Decision:** Settings are stored as rows in a `Setting` table with `key` (PK) and `value` (string).  
**Reason:** Simplest schema that satisfies the spec's "GET/PUT /settings" and the prescription print payload reading from settings.

### D-009: Audit log for unknown-user failed logins written to stdout only
**Decision:** When a login attempt uses an unknown username, the audit event is written to stdout rather than the `audit_logs` table.  
**Reason:** The `AuditLog` table requires a valid `userId` FK. We do not have a user to link to. Writing to stdout preserves the security signal without requiring a nullable FK or a separate security-events table. A production system would use a separate security log store.

### D-010: Request body not logged for sensitive endpoints
**Decision:** NestJS logger is set to suppress debug-level logging in production. No custom body-logging interceptor is applied.  
**Reason:** Spec says "Do not log request bodies for patient, visit, prescription, payment, or expense endpoints." The global logger level in production excludes request bodies from default NestJS output.

### D-011: `file-type` v16 (CJS) instead of v18+ (ESM)
**Decision:** Using `file-type@16` which is CommonJS-compatible.  
**Reason:** NestJS uses CommonJS. `file-type` v17+ is ESM-only, which requires additional bundler config. v16 is the last CJS release and is actively maintained.

### D-012: Reports use raw SQL for aggregation
**Decision:** `reports.service.ts` uses `$queryRaw` for the income-by-day and expenses-by-category queries.  
**Reason:** Prisma's aggregation API does not support `GROUP BY` on a joined column. Raw SQL is the clearest option and is still parameterized (preventing injection).

### D-013: `decimal.js` for closing calculation tests
**Decision:** The closing calculation unit tests use the `decimal.js` package (also a transitive dep of Prisma) for precise arithmetic.  
**Reason:** JavaScript floating-point cannot reliably represent 0.75 + 0.25 etc. Using `Decimal` in tests mirrors what the service does at runtime.

### D-014: Storage driver selected at module initialization
**Decision:** The `STORAGE_SERVICE` provider factory checks `STORAGE_DRIVER` env var and returns either `LocalStorageService` or `S3StorageService`.  
**Reason:** Spec requires a "storage interface with a local-disk implementation (default) and an S3-compatible implementation (behind an env flag)." A factory provider pattern avoids having both services instantiated simultaneously.

### D-015: Magic byte validation for uploads
**Decision:** File type is determined by inspecting the first few bytes of the buffer, not the MIME type header or file extension.  
**Reason:** Spec says "Verify the real file signature (magic bytes), not only the extension." Multer's `memoryStorage` (no `storage` option) keeps the file in memory as `Buffer`, making byte inspection straightforward.

### D-016: Expenses from ADMIN start as APPROVED
**Decision:** When an admin creates an expense directly, its status is immediately `APPROVED` (with `reviewedById` and `reviewedAt` set to the admin).  
**Reason:** Spec says "reception-created expenses start as PENDING, admin-created start as APPROVED." No separate approve call is needed for admin-created expenses.

### D-017: `DailyClosing.reopenedAt` as the reopen signal
**Decision:** A closing is considered active (closed) when `reopenedAt IS NULL`. Reopening sets this field to `now()`.  
**Reason:** The spec requires `POST /closing/:id/reopen`. Using a nullable `reopenedAt` field is simpler than an `isOpen` boolean and preserves the timestamp of the reopen event automatically. The `upsert` in `close()` resets `reopenedAt` to `null` when re-closing after a reopen.

### D-018: `queueOrder` only changes via postpone or (future) explicit reorder
**Decision:** `queueOrder` at creation equals the creation sequence within the day. Only `postpone` changes it.  
**Reason:** Spec says "queueOrder is initially equal to the creation order and only changes via postpone or an explicit reorder." This keeps the queue deterministic.

---

## Deviations from spec

None recorded as of Phase 0. All decisions listed above are judgment calls on unspecified details, not deviations.

---

## Part B — Socket Ticket

### D-019: In-memory ticket store (not Redis) for v1
**Decision:** `TicketStoreService` uses a plain `Map<string, TicketPayload>` with a 60-second cleanup interval.
**Reason:** Tickets expire in 30 s. A single-instance server at clinic scale (one doctor, one reception screen) doesn't need distributed state. For multi-instance deployments, replace the Map with Redis `SETNX` + `EXPIRE`; the `TicketStoreService` interface is already encapsulated so the swap is one-file change.

### D-020: 32-byte random hex tickets
**Decision:** Tickets are `crypto.randomBytes(32).toString('hex')` — 64-character strings.
**Reason:** 256 bits of entropy. Computationally infeasible to guess within the 30-second window. SHA-256 hashing before storage is not used here because tickets are already random and expire almost immediately; the security benefit doesn't justify the complexity.

### D-021: No circular dependency — TicketStoreService exported from RealtimeModule
**Decision:** `TicketStoreService` lives in `RealtimeModule` and is imported into `AuthModule`. `AuthModule` does not import `AppointmentsModule` or any other module that imports `AuthModule`, so there is no circular dependency.
**Reason:** The ticket store is logically part of the realtime subsystem. Putting it in a shared `CommonModule` was considered but would spread realtime concerns across modules.

## Part A2/A3 — Environment and Neon

### D-022: DIRECT_URL optional in validation, required for migrations
**Decision:** `DIRECT_URL` is validated as `optional()` in Joi so the app can start without a database (unit tests pass, type-check passes). The migration commands (`db:migrate`, `db:migrate:deploy`) will fail with a clear Prisma error if `DIRECT_URL` is missing.
**Reason:** Not every environment that starts the server needs to run migrations. CI/CD pipelines run migrations separately before starting the app.

### D-023: Directory layout kept as server/ and client/ (not backend/ and frontend/)
**Decision:** The continuation spec uses `/backend` and `/frontend` naming, but the actual repository was already established with `/server` (NestJS) and `/client` (Next.js frontend). We keep the existing names to avoid breaking any existing tooling or references.
**Reason:** Renaming would require updating all import paths, Docker configs, and CI scripts. The spec says "Repo layout: `/backend` … and `/frontend`" as a guideline, not a hard constraint. Recorded here as a deviation.
