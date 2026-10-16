# Clinic Management System — Backend API

Single-doctor clinic management system built with NestJS, PostgreSQL/Prisma, and Socket.IO.

---

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or Docker)
- npm

### 1. Clone and install
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values (minimum: DATABASE_URL, JWT secrets)
```

### 3. Start database (Docker)
```bash
docker-compose up postgres -d
```

### 4. Run migrations and seed
```bash
npx prisma migrate dev
npx ts-node prisma/seed.ts
```

### 5. Start the server
```bash
npm run start:dev
```

API: http://localhost:3000/api/v1  
Swagger: http://localhost:3000/docs

---

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Development server with hot-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start:prod` | Production server from `dist/` |
| `npm test` | Unit tests with coverage |
| `npm run test:e2e` | End-to-end tests (requires test DB) |
| `npm run test:cov` | Unit tests + coverage report |
| `npx prisma migrate dev` | Apply pending migrations (dev) |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma studio` | Visual DB browser |
| `npx ts-node prisma/seed.ts` | Seed the database |
| `./scripts/backup.sh` | Backup the database |

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
├── realtime/          # Socket.IO gateway
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
| Expenses (read all) | ✅ | ❌ | own today |
| Daily closing (submit) | ✅ | ❌ | ✅ |
| Daily closing (preview/reopen) | ✅ | ❌ | ❌ |
| Reports | ✅ | ❌ | ❌ |
| Audit logs | ✅ | ❌ | ❌ |
| Settings | ✅ | ❌ | ❌ |

---

## Realtime Events (Socket.IO)

Connect to `ws://localhost:3000` with the access token in the handshake:
```js
const socket = io('http://localhost:3000', {
  auth: { token: '<accessToken>' }
});
```

| Event | Direction | Payload | Recipients |
|---|---|---|---|
| `queue.updated` | Server → Client | Today's queue array | ALL roles |
| `appointment.completed` | Server → Client | `{ appointmentId, patientName, queueNumber }` | ADMIN, RECEPTION |
| `next.patient` | Server → Client | `{ appointmentId, patientId }` | DOCTOR |
| `doctor.status.changed` | Server → Client | `{ doctorId, status }` | ALL roles |

---

## Data Backup and Restore

### Backup
```bash
./scripts/backup.sh ./backups
```

### Restore
```bash
pg_restore -d "$DATABASE_URL" --clean --if-exists ./backups/clinic_backup_<timestamp>.dump
```

---

## Environment Variables

See `.env.example` for all variables with documentation.

Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_ACCESS_SECRET` — minimum 32 chars
- `JWT_REFRESH_SECRET` — minimum 32 chars
- `CLINIC_TIMEZONE` — IANA timezone (default: `Africa/Cairo`)
- `STORAGE_DRIVER` — `local` or `s3`
- `CORS_ORIGINS` — comma-separated allowed origins

---

## API Documentation

Swagger UI is available at `/docs` in non-production environments.

All endpoints follow:
- Base path: `/api/v1`
- Pagination: `?page=1&pageSize=20` → `{ data: [], meta: { page, pageSize, total, totalPages } }`
- Errors: `{ error: { code: "STRING_CODE", message: "...", details?: any } }`
- Dates: ISO 8601 UTC strings; `clinicDate` is `YYYY-MM-DD`
