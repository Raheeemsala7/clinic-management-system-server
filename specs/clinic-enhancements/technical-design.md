# Technical Design: Clinic Management System Enhancements

## 1. Architecture Overview

The system consists of two primary applications:
1. **Frontend (`client/`)**: Next.js 16.3.0 App Router, React 19, Tailwind CSS, Lucide Icons, Shadcn UI primitives (Radix), Zod validation, `next-intl` internationalization.
2. **Backend (`server/`)**: Express 5.3.0, Node.js, Mongoose 9.11.2 (MongoDB Atlas / local), JWT authentication with refresh token rotation, Role-Based Access Control (`ADMIN`, `DOCTOR`, `RECEPTION`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Next.js 16 (Client)                             │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │   next-intl (en / ar) │  │  Dedicated Booking Page               │  │
│  │   RTL / LTR Switcher  │  │  - 4-Part Name Patient Validation     │  │
│  │   Cookie / URL Sync   │  │  - 5 Color-Coded Appointment Types    │  │
│  └───────────────────────┘  │  - Staged Image Previews & Upload     │  │
│                             │  - Dynamic Patient Summary Panel      │  │
│                             └───────────────────────────────────────┘  │
│                                  │ (Server Actions & api client)       │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │ HTTPS / REST (JWT in Cookie)
┌──────────────────────────────────▼─────────────────────────────────────┐
│                        Express 5 (Backend)                             │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │  Patient & Booking API │  │  File Upload & Storage Service       │  │
│  │  - 4-part name check   │  │  - Magic-byte verification (file-type│  │
│  │  - 5 appointment types │  │  - Local uploads/appointments disk   │  │
│  │  - /booking-summary    │  │  - Sanitized URLs & metadata storage │  │
│  └────────────────────────┘  └──────────────────────────────────────┘  │
│                                  │                                     │
│  ┌───────────────────────────────▼──────────────────────────────────┐  │
│  │                    Mongoose 9 Data Layer                         │  │
│  │  - Appointments (type enum, attachments[])                       │  │
│  │  - Patients (4-part fullName, searchName)                        │  │
│  │  - Payments (kind enum, appointmentId, patientId)                │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Localization Architecture (`next-intl`)

### Configuration & Locale Routing
- Supported locales: `en` (default), `ar` (secondary).
- Cookie name: `NEXT_LOCALE`.
- Locale configuration (`client/src/i18n/routing.ts`):
  ```ts
  export const locales = ['en', 'ar'] as const;
  export type Locale = (typeof locales)[number];
  export const defaultLocale: Locale = 'en';
  ```
- Request configuration (`client/src/i18n/request.ts`):
  Dynamically loads `messages/${locale}.json` using `getRequestConfig`.
- Proxy / Middleware Integration (`client/src/proxy.ts`):
  The existing route-guard proxy is extended to inspect cookie `NEXT_LOCALE` or query param, falling back to `en`. Session protection and role boundaries remain strictly enforced.
- Root Layout Integration (`client/src/app/layout.tsx`):
  Reads active locale from cookies/headers and dynamically sets:
  ```tsx
  <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} className={locale === 'ar' ? cairo.variable : inter.variable}>
  ```
- Shell Navigation Switcher (`client/src/components/shell/locale-switcher.tsx`):
  Allows instantaneous switching between English and Arabic with page refresh and cookie update.

### Translation Files Organization
- `client/src/messages/en.json`: Complete English message dictionary.
- `client/src/messages/ar.json`: Complete Arabic message dictionary (migrated and expanded from `client/src/messages/ar.ts`).
- Key categories: `common`, `nav`, `auth`, `roles`, `appointmentTypes`, `appointmentStatus`, `appointmentSource`, `doctorStatus`, `queue`, `patients`, `visits`, `payments`, `expenses`, `closing`, `reports`, `dashboard`, `settings`, `users`, `audit`, `booking`.

---

## 3. Patient Four-Part Name Validation

### Normalization & Validation Logic
Shared helper:
```ts
export function validateFourPartName(rawName: string): {
  isValid: boolean;
  normalized: string;
  partsCount: number;
} {
  if (!rawName || typeof rawName !== 'string') {
    return { isValid: false, normalized: '', partsCount: 0 };
  }
  // Trim and collapse whitespace
  const normalized = rawName.trim().replace(/\s+/g, ' ');
  const parts = normalized.split(' ').filter((p) => p.length > 0);
  return {
    isValid: parts.length >= 4,
    normalized,
    partsCount: parts.length,
  };
}
```

### Application Points
1. **Frontend Form Validation**:
   - `client/src/features/patients/actions.ts`:
     ```ts
     fullName: z.string().refine((val) => validateFourPartName(val).isValid, {
       message: 'PATIENT_NAME_FOUR_PARTS_REQUIRED',
     }),
     ```
2. **Backend Service Validation**:
   - `server/src/services/patients.service.ts`:
     Executed in `createPatient` and `updatePatient`. If `!validateFourPartName(fullName).isValid`, throw `BadRequestError('FULL_NAME_FOUR_PARTS_REQUIRED')`.
3. **Existing Patient Selection**:
   - When an existing patient is selected, their saved `id` and `fullName` are attached to the booking form. No re-validation or modification occurs on their stored name record.

---

## 4. Five Color-Coded Appointment Types

### Data Model & Compatibility
- Supported types:
  1. `EXAMINATION` (label: "Examination" / "كشف")
  2. `FOLLOW_UP` (label: "Follow-up Visit" / "إعادة")
  3. `POST_OPERATIVE` (label: "Post-operative Follow-up" / "متابعة عملية")
  4. `LAB_TESTS_IMAGING` (label: "Lab Tests & Imaging" / "تحليل و أشعة")
  5. `TEST_RESULTS_REVIEW` (label: "Test Results Review" / "مراجعة فحوصات")
  6. `CONSULTATION` (legacy alias; backward-compatible with `EXAMINATION`)

- Mongoose Schema Update (`server/src/models/appointment.model.ts`):
  ```ts
  type: {
    type: String,
    enum: [
      'EXAMINATION',
      'FOLLOW_UP',
      'POST_OPERATIVE',
      'LAB_TESTS_IMAGING',
      'TEST_RESULTS_REVIEW',
      'CONSULTATION', // legacy alias
    ],
    required: true,
  }
  ```

### Centralized Color System (`client/src/lib/appointment-types.ts`)
```ts
export interface AppointmentTypeConfig {
  id: 'EXAMINATION' | 'FOLLOW_UP' | 'POST_OPERATIVE' | 'LAB_TESTS_IMAGING' | 'TEST_RESULTS_REVIEW';
  color: 'blue' | 'green' | 'purple' | 'orange' | 'teal';
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
  activeRingClass: string;
  arLabel: string;
  enLabel: string;
}

export const APPOINTMENT_TYPES: Record<string, AppointmentTypeConfig> = {
  EXAMINATION: {
    id: 'EXAMINATION',
    color: 'blue',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-200 dark:border-blue-800',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 border-blue-300',
    activeRingClass: 'ring-2 ring-blue-500 border-blue-500',
    arLabel: 'كشف',
    enLabel: 'Examination',
  },
  FOLLOW_UP: {
    id: 'FOLLOW_UP',
    color: 'green',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300',
    activeRingClass: 'ring-2 ring-emerald-500 border-emerald-500',
    arLabel: 'إعادة',
    enLabel: 'Follow-up Visit',
  },
  POST_OPERATIVE: {
    id: 'POST_OPERATIVE',
    color: 'purple',
    bgClass: 'bg-purple-50 dark:bg-purple-950/40',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-200 dark:border-purple-800',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 border-purple-300',
    activeRingClass: 'ring-2 ring-purple-500 border-purple-500',
    arLabel: 'متابعة عملية',
    enLabel: 'Post-operative Follow-up',
  },
  LAB_TESTS_IMAGING: {
    id: 'LAB_TESTS_IMAGING',
    color: 'orange',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-800',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200 border-amber-300',
    activeRingClass: 'ring-2 ring-amber-500 border-amber-500',
    arLabel: 'تحليل و أشعة',
    enLabel: 'Lab Tests & Imaging',
  },
  TEST_RESULTS_REVIEW: {
    id: 'TEST_RESULTS_REVIEW',
    color: 'teal',
    bgClass: 'bg-teal-50 dark:bg-teal-950/40',
    textClass: 'text-teal-700 dark:text-teal-300',
    borderClass: 'border-teal-200 dark:border-teal-800',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200 border-teal-300',
    activeRingClass: 'ring-2 ring-teal-500 border-teal-500',
    arLabel: 'مراجعة فحوصات',
    enLabel: 'Test Results Review',
  },
};
```

---

## 5. Image Attachments Architecture

### Schema Extension
`Appointment` model in `server/src/models/appointment.model.ts`:
```ts
export interface IAttachmentMeta {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
}

// In AppointmentSchema:
attachments: [
  {
    id: { type: String, default: uuidv4 },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
],
```

### Upload Service & Security
- Endpoint: `POST /api/v1/attachments/upload` (accepts base64 or multipart images).
- Validation:
  - Magic byte verification using `file-type`:
    - Checks buffer headers against `image/jpeg`, `image/png`, `image/webp`.
    - Rejects SVGs, executables, scripts, and spoofed extensions with `INVALID_FILE_TYPE`.
  - Max file size: 5 MB per image (`FILE_TOO_LARGE`).
  - Max count: 5 images per booking (`MAX_ATTACHMENTS_EXCEEDED`).
- Local Storage:
  - Files stored under `server/uploads/appointments/` with randomized UUID filenames (`${uuid}.${ext}`).
  - Served securely via `GET /api/v1/attachments/file/:filename` with authentication and cache-control headers.

---

## 6. Existing Patient Booking Summary

### Dedicated Endpoint
`GET /api/v1/patients/:id/booking-summary`
- Permissions: `ADMIN`, `DOCTOR`, `RECEPTION`.
- Response contract:
  ```json
  {
    "patient": {
      "id": "uuid",
      "fullName": "Ahmed Mohamed Ali Hassan",
      "phone": "01012345678",
      "gender": "MALE",
      "age": 34,
      "dateOfBirth": "1992-05-12T00:00:00.000Z",
      "address": "Cairo, Egypt"
    },
    "lastVisit": {
      "date": "2026-10-15T11:00:00.000Z",
      "appointmentType": "EXAMINATION",
      "doctorName": "Dr. Sarah",
      "diagnosis": "Seasonal allergic rhinitis",
      "notes": "Prescribed antihistamines",
      "status": "COMPLETED"
    },
    "financialSummary": {
      "totalCharged": 600,
      "totalPaid": 400,
      "outstandingBalance": 200,
      "paymentStatus": "PARTIAL",
      "lastPaymentDate": "2026-10-15T11:30:00.000Z"
    },
    "previousAppointments": [
      {
        "id": "uuid",
        "clinicDate": "2026-10-15",
        "type": "EXAMINATION",
        "status": "COMPLETED",
        "startTime": "11:00",
        "paidAmount": 400,
        "remainingAmount": 200
      }
    ]
  }
  ```

### Patient Summary Component (`client/src/components/appointments/patient-summary-panel.tsx`)
- Rendered on the booking page immediately upon selecting an existing patient.
- Collapsible cards for:
  1. Basic Contact & Identifiers.
  2. Last Visit & Clinical Overview.
  3. Financial Balance & Payments Status (highlighting outstanding balances in amber/red).
  4. Recent Appointments History.

---

## 7. Dedicated Booking Page (`/reception/appointments/new`)

### Layout & Workflow
- Route: `client/src/app/reception/appointments/new/page.tsx` (and `.../[id]/edit/page.tsx`).
- Sections:
  1. **Section 1: Patient Selection / Creation**
     - Search combobox with live debouncing (`searchPatientsAction`).
     - Or toggle to "Register New Patient" requiring full 4-part name.
     - When existing patient is selected, `PatientSummaryPanel` mounts automatically.
  2. **Section 2: Appointment Type**
     - 5 interactive cards showing colored badges, background tints, and active rings.
  3. **Section 3: Scheduling & Details**
     - Doctor selection, Clinic Date, Time Slots with live availability check, Source (`SCHEDULED` vs `WALK_IN`).
  4. **Section 4: Attachments**
     - Drag-and-drop file dropzone, image thumbnail previews, file size indicators, delete buttons.
  5. **Section 5: Financials**
     - Fee calculation, upfront payment input, remaining balance live display, payment method (`CASH`, `CARD`, `WALLET`), exemption toggle.
  6. **Section 6: Review & Submit**
     - Save button (with loading spinner), cancel button navigating back to calendar/appointments.
