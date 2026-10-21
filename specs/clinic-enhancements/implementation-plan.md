# Implementation Plan: Clinic Management System Enhancements

## Phase Overview & Order of Execution

```
[Phase 1: Discovery & Analysis] ✅ Complete
       │
[Phase 2: Specification Deliverables] (In Progress)
       │
[Phase 3: Backend Enhancements]
  ├── Task 3.1: 4-part name validation & normalization
  ├── Task 3.2: 5 appointment types enum & compatibility in Mongoose models
  ├── Task 3.3: Image attachments schema, upload service, and endpoint
  └── Task 3.4: Patient booking summary endpoint (/patients/:id/booking-summary)
       │
[Phase 4: Internationalization (next-intl)]
  ├── Task 4.1: next-intl setup (i18n request, routing, proxy middleware)
  ├── Task 4.2: Full message catalogs (messages/en.json and messages/ar.json)
  ├── Task 4.3: App layout, HTML lang/dir, Cairo/Inter font configuration
  └── Task 4.4: AppShell header locale switcher component with persistence
       │
[Phase 5: Centralized Appointment Color System & UI Components]
  ├── Task 5.1: Appointment type centralized config (src/lib/appointment-types.ts)
  ├── Task 5.2: Reusable AppointmentTypeBadge component
  ├── Task 5.3: Update calendar, queue board, today screen, tables to use 5 types
  └── Task 5.4: Patient summary panel component (src/components/appointments/patient-summary-panel.tsx)
       │
[Phase 6: Dedicated Booking Page Implementation]
  ├── Task 6.1: Dedicated route (/reception/appointments/new and /admin/appointments/new)
  ├── Task 6.2: Section 1 - Patient Search, Inline 4-Part Register & Live Summary
  ├── Task 6.3: Section 2 - Visual 5-Type Selector with Color Badges
  ├── Task 6.4: Section 3 - Doctor, Date, Dynamic Slot Availability
  ├── Task 6.5: Section 4 - Image Attachments (Preview, Removal, Staged Upload)
  ├── Task 6.6: Section 5 - Financial Fees, Advance Payment, Exemption Reason
  ├── Task 6.7: Section 6 - Review Summary, Localized Save & Cancel
  └── Task 6.8: Edit booking support (/appointments/[id]/edit)
       │
[Phase 7: Navigation & Action Entry Points]
  ├── Task 7.1: Add "New Booking" / "حجز جديد" action buttons across shell, calendar, queue
  └── Task 7.2: Replace modal-only trigger with direct page navigation
       │
[Phase 8: Comprehensive Verification & Testing]
  ├── Task 8.1: Backend Jest / API tests
  ├── Task 8.2: Frontend TypeScript check (`tsc --noEmit`)
  ├── Task 8.3: Next.js production build (`next build`)
  └── Task 8.4: Playwright E2E and visual RTL/LTR inspection
```

---

## Detailed Task Breakdown

### Task 3.1: Backend 4-Part Patient Name Validation
- **Files**: `server/src/utils/arabic.ts`, `server/src/services/patients.service.ts`
- **Actions**:
  1. Add `validateFourPartName(name: string)` helper in `server/src/utils/arabic.ts`.
  2. Normalize whitespace, count non-empty parts, require `>= 4`.
  3. Enforce in `PatientsService.createPatient` and `PatientsService.updatePatient`.
  4. Throw `BadRequestError('FULL_NAME_FOUR_PARTS_REQUIRED')` with descriptive message if invalid.
- **Dependency**: None.

### Task 3.2: Backend Appointment Types & Backward Compatibility
- **Files**: `server/src/models/appointment.model.ts`, `server/src/models/payment.model.ts`, `server/src/services/appointments.service.ts`
- **Actions**:
  1. Expand `type` enum in `AppointmentSchema`: `['EXAMINATION', 'FOLLOW_UP', 'POST_OPERATIVE', 'LAB_TESTS_IMAGING', 'TEST_RESULTS_REVIEW', 'CONSULTATION']`.
  2. Expand `kind` enum in `PaymentSchema`.
  3. Map legacy `CONSULTATION` to `EXAMINATION` in responses/service logic.
- **Dependency**: None.

### Task 3.3: Backend Image Attachments & Upload Endpoint
- **Files**: `server/src/models/appointment.model.ts`, `server/src/routes/attachments.routes.ts`, `server/src/controllers/attachments.controller.ts`, `server/src/services/attachments.service.ts`, `server/src/app.ts`
- **Actions**:
  1. Add `attachments` array field to `AppointmentSchema` with `{ id, fileName, fileSize, mimeType, url, uploadedAt }`.
  2. Implement upload route `POST /api/v1/attachments/upload` checking magic bytes via `file-type` (JPEG, PNG, WebP), max size (5 MB), max count (5).
  3. Store files in `server/uploads/appointments/` with UUID naming.
  4. Provide static or authenticated streaming endpoint for viewing uploaded images.
- **Dependency**: Task 3.2.

### Task 3.4: Patient Booking Summary Endpoint
- **Files**: `server/src/routes/patients.routes.ts`, `server/src/controllers/patients.controller.ts`, `server/src/services/patients.service.ts`
- **Actions**:
  1. Add route `GET /patients/:id/booking-summary` accessible to `ADMIN`, `DOCTOR`, `RECEPTION`.
  2. Fetch patient basic info, last visit (date, type, doctor, diagnosis), financial summary (totalCharged, totalPaid, outstandingBalance, paymentStatus), and recent appointment history.
- **Dependency**: Task 3.1.

### Task 4.1 - 4.4: Complete Internationalization (`next-intl`)
- **Files**: `client/src/i18n/routing.ts`, `client/src/i18n/request.ts`, `client/src/proxy.ts`, `client/src/messages/en.json`, `client/src/messages/ar.json`, `client/src/app/layout.tsx`, `client/src/components/shell/locale-switcher.tsx`
- **Actions**:
  1. Set up `next-intl` configuration with `en` default and `ar` secondary.
  2. Combine proxy route guard with locale cookie check (`NEXT_LOCALE`).
  3. Export comprehensive `en.json` and `ar.json` dictionaries covering all screens.
  4. Dynamically set `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>` in `layout.tsx`.
  5. Add `LocaleSwitcher` button in shell header to toggle English/Arabic.
- **Dependency**: `next-intl` package installed.

### Task 5.1 - 5.4: Centralized Appointment Color System & UI Components
- **Files**: `client/src/lib/appointment-types.ts`, `client/src/components/appointments/appointment-type-badge.tsx`, `client/src/components/appointments/patient-summary-panel.tsx`
- **Actions**:
  1. Create `appointment-types.ts` defining color schemes (Blue, Green, Purple, Orange, Teal).
  2. Create `<AppointmentTypeBadge type={type} />`.
  3. Create `<PatientSummaryPanel summary={data} onClear={() => ...} />` with collapsible sections and outstanding balance highlights.
  4. Update `AppointmentCalendar`, queue cards, and tables to render the new badges.
- **Dependency**: Task 4.2.

### Task 6.1 - 6.8: Dedicated Booking Page
- **Files**: `client/src/app/reception/appointments/new/page.tsx`, `client/src/app/admin/appointments/new/page.tsx`, `client/src/app/reception/appointments/[id]/edit/page.tsx`, `client/src/features/appointments/booking-form.tsx`
- **Actions**:
  1. Build dedicated booking page with clean, responsive full-page layout.
  2. Implement the 6 required sections:
     - Section 1: Patient selector (live search) + 4-part name new patient creation + dynamic summary panel.
     - Section 2: 5 Color-coded appointment types with visual card selection.
     - Section 3: Scheduling details (doctor, date, real-time slots availability).
     - Section 4: Image attachments (staged previews, file validation, deletion).
     - Section 5: Financial details (fees, upfront payment, live remaining balance calculation, exemption reason).
     - Section 6: Summary & actions (Save with loading state, Cancel button).
  3. Support edit mode (`/appointments/[id]/edit`) preloading existing appointment data and attachments.
- **Dependency**: Tasks 3.1 - 3.4, 4.1 - 4.4, 5.1 - 5.4.

### Task 7.1 - 7.2: Navigation & Action Entry Points
- **Files**: `client/src/components/shell/nav-config.ts`, `client/src/components/appointments/appointment-calendar.tsx`, `client/src/app/reception/queue-board.tsx`
- **Actions**:
  1. Add prominent "New Booking" button in shell nav and calendar toolbar linking to `/reception/appointments/new`.
  2. Keep dialog as an optional quick-action or forward directly to the dedicated page.
- **Dependency**: Task 6.1.

### Task 8.1 - 8.4: Verification & Testing
- **Actions**:
  1. Run unit/API tests for 4-part name validation, appointment types, and booking summary.
  2. Run `tsc --noEmit` on client and server.
  3. Run `next build` on client.
  4. Verify full workflow in both Arabic RTL and English LTR.
