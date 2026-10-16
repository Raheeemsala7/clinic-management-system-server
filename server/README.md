# Clinic Management System — Backend API

Single-doctor clinic management system built with NestJS, PostgreSQL/Prisma, and Socket.IO.

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm (used in this repo) or npm

### 1. Install dependencies
```bash
pnpm install
# or: npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Open server/.env and fill in DATABASE_URL, DIRECT_URL, and the JWT secrets.
# Read the seeded credentials from server/.env after running db:seed.
```

### 3. Run migrations (requires DIRECT_URL to be set)
```bash
npm run db:migrate
```

### 4. Seed the database
```bash
npm run db:seed
# Credentials are written to server/.env — read them there. Never echoed here.
```

### 5. Start the development server
```bash
npm run start:dev
```

API:     http://localhost:4000/api/v1  
Swagger: http://localhost:4000/docs  
OpenAPI JSON (for type generation): http://localhost:4000/docs-json

---

## Neon PostgreSQL Notes

Neon provides two connection strings:

| String | Host contains | Used for |
|--------|---------------|----------|
| `DATABASE_URL` | `-pooler` in hostname | Running application (pooled) |
| `DIRECT_URL` | no `-pooler` | Prisma migrations and seed only |

**Important:** If your Neon connection string contains `channel_binding=require`, **remove that parameter** and keep only `sslmode=require`. Example:

```
# Bad:  postgresql://user:pw@host/db?sslmode=require&channel_binding=require
# Good: postgresql://user:pw@host/db?sslmode=require
```

Neon's free tier **cold-starts** after inactivity. The server automatically retries the first connection once (3 s delay) to handle this.

---

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Development server with hot-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Production server from `dist/` |
| `npm run db:migrate` | Run Prisma migrations (needs `DIRECT_URL`) |
| `npm run db:seed` | Seed the database |
| `npm run db:migrate:deploy` | Apply migrations in production (no prompt) |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run test` | Unit tests |
| `npm run test:cov` | Unit tests + coverage report |
| `npm run test:e2e` | End-to-end tests (requires test DB) |
| `npm run prisma:generate` | Regenerate Prisma client after schema changes |

---

## Architecture

```
src/
├── auth/              # JWT auth, refresh token rotation
├── users/             # User CRUD (admin only)
├── patients/          # Patient management, Arabic search
├── appointments/      # Appointment lifecycle & state machine
├── queue/             # Queue view, doctor status
├── visits/            # Clinical visit with autosave
├── prescriptions/     # Prescriptions (immutable, versioned)
├── drugs/             # Drug autocomplete catalog
├── attachments/       # File upload (local/S3)
├── payments/          # Payment recording
├── expenses/          # Expense management with approval
├── closing/           # Daily cash closing
├── reports/           # Financial reports (admin only)
├── audit/             # Audit log
├── settings/          # Clinic settings
├── realtime/          # Socket.IO gateway + socket tickets
└── common/            # Guards, filters, decorators, utils
```

---

## Permission Matrix

| Route Area | ADMIN | DOCTOR | RECEPTION |
|---|---|---|---|
| Auth (login/refresh) | ✅ | ✅ | ✅ |
| Users CRUD | ✅ | ❌ | ❌ |
| Patients (basic) | ✅ | ✅ | ✅ |
| Patients (medical fields) | ✅ | ✅ | ❌ |
| Patient history/summary | ✅ | ✅ | ❌ |
| Appointments (create) | ✅ | ❌ | ✅ |
| Appointments (read) | ✅ | ✅ | ✅ |
| Appointments (start/cancel) | ✅ | ❌ | ✅ |
| Appointments (complete) | ✅ | ✅ | ✅ |
| Queue (read) | ✅ | ✅ | ✅ |
| Doctor status (set) | ❌ | ✅ | ❌ |
| Visits (read/write) | ✅ | ✅ | ❌ |
| Prescriptions | ✅ | ✅ | ❌ |
| Attachments | ✅ | ✅ | ❌ |
| Payments (create) | ✅ | ❌ | ✅ |
| Payments (void) | ✅ | ❌ | ❌ |
| Expenses (create) | ✅ | ❌ | ✅ |
| Expenses (approve/reject) | ✅ | ❌ | ❌ |
| Daily closing (submit) | ✅ | ❌ | ✅ |
| Daily closing (preview/reopen) | ✅ | ❌ | ❌ |
| Reports | ✅ | ❌ | ❌ |
| Audit logs | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ |

---

## Realtime Events (Socket.IO)

Two auth methods for the Socket.IO handshake:

**Bearer token (server-to-server):**
```js
const socket = io('http://localhost:4000', { auth: { token: '<accessToken>' } });
```

**One-time ticket (browser — token never reaches the client):**
```js
// 1. Server Action calls POST /api/v1/auth/socket-ticket → { ticket, expiresInSeconds: 30 }
// 2. Browser connects with the ticket
const socket = io('http://localhost:4000', { auth: { ticket: '<ticket>' } });
// The ticket is consumed on first use; request a new one on every reconnect.
```

| Event | Direction | Payload | Recipients |
|---|---|---|---|
| `queue.updated` | Server → Client | Today's queue array | ALL roles |
| `appointment.completed` | Server → Client | `{ appointmentId, patientName, queueNumber }` | ADMIN, RECEPTION |
| `next.patient` | Server → Client | `{ appointmentId, patientId }` | DOCTOR |
| `doctor.status.changed` | Server → Client | `{ doctorId, status }` | ALL roles |

---

## Database Backup and Restore

```bash
# Backup
./scripts/backup.sh ./backups

# Restore
pg_restore -d "$DATABASE_URL" --clean --if-exists ./backups/clinic_backup_<timestamp>.dump
```
