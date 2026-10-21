# Requirements Specification: Clinic Management System Enhancements

## 1. Executive Summary & Objective

The objective of this project is to enhance the existing clinic management system (single-doctor/multi-role clinic platform) with five major capabilities while maintaining total backward compatibility, strict role-based access control (RBAC), and robust data integrity:

1. **Complete Arabic & English Localization**: Seamless bilingual internationalization using `next-intl` with English (`en`) as default and Arabic (`ar`) as secondary, full RTL/LTR layout transitions, language persistence, and 100% translation of all user-facing screens and messages.
2. **Patient Booking Four-Part Full Name**: Rigorous client and server validation ensuring all patient names consist of at least four non-empty name components, with whitespace normalization and localized error messages.
3. **Color-Coded Appointment Types**: Expansion to five visually distinct, consistent appointment types across all views (Examination, Follow-up Visit, Post-operative Follow-up, Lab Tests & Imaging, Test Results Review) with centralized badge styling and backward compatibility for existing records.
4. **Image Attachments During Booking**: Full-lifecycle image attachment support during booking creation and editing, complete with client-side previews, removal, server-side MIME and magic-byte security checks, and persistent metadata storage.
5. **Selecting an Existing Patient with Comprehensive History**: Instant retrieval and display of basic info, latest visit/examination, financial balance and payments, and previous appointment history directly inside the booking form without losing form state.
6. **Dedicated Booking Page**: A standalone booking page (`/reception/appointments/new` and `/admin/appointments/new`, plus edit mode) structured into six distinct logical sections, replacing modal-only workflows.

---

## 2. Functional Requirements

### FR-1: Full Arabic & English Internationalization (`next-intl`)
- **FR-1.1**: Default locale shall be English (`en`); secondary locale shall be Arabic (`ar`).
- **FR-1.2**: Users must be able to switch locales seamlessly from the application shell header.
- **FR-1.3**: Locale selection must persist across sessions, page refreshes, and direct navigation via cookie and URL routing parameters.
- **FR-1.4**: Arabic interface must render in Right-to-Left (`dir="rtl"`) with appropriate typography (Cairo/Tajawal), flipped logical layouts, and mirrored icons where directionally sensitive.
- **FR-1.5**: English interface must render in Left-to-Right (`dir="ltr"`) with standard typography and alignment.
- **FR-1.6**: Zero hardcoded strings shall remain in user-facing components; all strings, placeholders, labels, errors, confirmation dialogs, toast notifications, badges, and empty states shall be sourced from `messages/en.json` and `messages/ar.json` via `next-intl`.
- **FR-1.7**: Dates, times, numbers, and currency values must format in accordance with the active locale (`Intl.DateTimeFormat`, `Intl.NumberFormat`).

### FR-2: Patient Four-Part Name Validation
- **FR-2.1**: When creating or updating a patient, the system must require a full four-part name.
- **FR-2.2**: Input must be trimmed of leading/trailing whitespace, and consecutive whitespace characters collapsed into single spaces before counting parts.
- **FR-2.3**: The normalized name must split into at least 4 non-empty parts separated by spaces (e.g., `Ahmed Mohamed Ali Hassan` is valid; `Ahmed Mohamed Ali` is invalid).
- **FR-2.4**: Validation must execute on both frontend (Zod schema in Server Actions & client forms) and backend (`PatientsService.createPatient` and `PatientsService.updatePatient`).
- **FR-2.5**: Localized error messages must clearly communicate the 4-part name requirement:
  - English: *"Please enter the patient's full four-part name (at least 4 names)."*
  - Arabic: *"يجب إدخال اسم المريض رباعياً على الأقل (أربعة مقاطع)."*
- **FR-2.6**: When selecting an existing patient in the booking flow, their existing saved name is reused without forcing re-validation or altering their saved record.

### FR-3: Five Color-Coded Appointment Types
- **FR-3.1**: The system must support five distinct appointment types:
  1. `EXAMINATION` (كشف / Examination) — Blue
  2. `FOLLOW_UP` (إعادة / Follow-up Visit) — Green
  3. `POST_OPERATIVE` (متابعة عملية / Post-operative Follow-up) — Purple
  4. `LAB_TESTS_IMAGING` (تحليل و أشعة / Lab Tests & Imaging) — Orange
  5. `TEST_RESULTS_REVIEW` (مراجعة فحوصات / Test Results Review) — Teal
- **FR-3.2**: Existing records with legacy `CONSULTATION` type must be backward-compatible and map automatically to `EXAMINATION`.
- **FR-3.3**: Visual representation must use centralized color tokens and styles ensuring accessible contrast in light and dark modes, pairing color badges with translated text labels (never color alone).
- **FR-3.4**: Color badges must be consistently applied across the dedicated booking page, calendar view, queue list, appointments table, doctor today screen, patient visit history, and dashboard summaries.
- **FR-3.5**: Type selection controls in the booking page must present visual differentiation prior to selection and clear selection states.

### FR-4: Image Attachments in Booking Workflow
- **FR-4.1**: Staff must be able to select and attach single or multiple images during appointment creation and editing.
- **FR-4.2**: Supported formats shall be restricted to `image/jpeg`, `image/png`, and `image/webp`.
- **FR-4.3**: Client-side preview thumbnails with filename and size must be displayed immediately upon file selection.
- **FR-4.4**: Staff must be able to remove any staged image preview prior to submission.
- **FR-4.5**: Maximum file size per image shall be 5 MB, and maximum images per booking shall be 5.
- **FR-4.6**: The server must validate actual file buffer signatures (magic bytes) to prevent forged file extensions.
- **FR-4.7**: Image attachments must be persisted with metadata (`id`, `url`, `fileName`, `fileSize`, `mimeType`, `uploadedAt`) linked to the appointment record.
- **FR-4.8**: When editing an existing booking, previously saved attachments must remain preserved unless explicitly removed by the user.

### FR-5: Selecting Existing Patient with Comprehensive History
- **FR-5.1**: The booking interface must provide a debounced, searchable patient selector searching by full name, normalized Arabic name, phone number, and patient ID.
- **FR-5.2**: Upon selection, a dedicated Patient Summary Panel must automatically render directly inside the booking page without full page reload.
- **FR-5.3**: The Summary Panel must present:
  - **Basic Information**: Full 4-part name, phone number, age, gender, date of birth, address, and patient ID.
  - **Last Examination / Visit**: Date of most recent visit, appointment type (with color badge), attending doctor, diagnosis, and notes (where permitted by role).
  - **Payment & Financial Summary**: Total fees charged, total paid amount, outstanding balance (`remainingAmount`), and payment status (`PAID`, `PARTIAL`, `UNPAID`).
  - **Previous Appointments**: Chronological list of recent visits with dates, color-coded types, and statuses.
- **FR-5.4**: The panel must include collapsible/expandable sections to maintain high usability and minimize vertical scrolling.
- **FR-5.5**: A prominent "Change Patient" button must allow staff to clear the selection and choose another patient or create a new one.
- **FR-5.6**: Switching patients must completely reset displayed history, preventing stale data contamination.
- **FR-5.7**: Patients without prior visit or payment history must display clear, user-friendly empty states.
- **FR-5.8**: Reception role must be permitted to read the booking summary (including financial balance and appointment history) while strictly respecting medical field permissions.

### FR-6: Dedicated Booking Page
- **FR-6.1**: A dedicated booking page must exist at `/reception/appointments/new` and `/admin/appointments/new`, with an edit variant at `.../appointments/[id]/edit`.
- **FR-6.2**: Navigation bars, appointment calendar headers, and tables must feature a prominent "New Booking" / "حجز جديد" button that navigates directly to this route.
- **FR-6.3**: The booking page layout must be structured into six organized sections:
  1. Patient selection & summary / new patient registration.
  2. Appointment type selection with color-coded options.
  3. Scheduling details: doctor selection, date, time slots, source (`SCHEDULED` vs `WALK_IN`).
  4. Image attachments with preview and removal.
  5. Financial details: fees, deposit/advance payment, exemption controls.
  6. Booking summary and submission actions.
- **FR-6.4**: Form submission must provide responsive validation feedback, loading state, and upon success, redirect to the appointments view with localized confirmation toast.

---

## 3. Non-Functional Requirements

- **NFR-1 (Performance)**: Patient search debouncing must trigger within 300ms; booking summary retrieval must complete in < 350ms.
- **NFR-2 (Security & RBAC)**: Uploaded images must be authenticated, verified via magic bytes, and sanitized to prevent directory traversal or script execution. Only authorized roles (`ADMIN`, `RECEPTION`, `DOCTOR`) can access booking attachments.
- **NFR-3 (Accessibility & Contrast)**: All five appointment type color badges must meet WCAG 2.1 AA standards for contrast (minimum 4.5:1 for normal text). Text labels must always accompany color indicators.
- **NFR-4 (Responsive Design)**: The dedicated booking page and summary panel must adapt seamlessly to desktop (>= 1024px), tablet (768px-1023px), and mobile (< 768px).
- **NFR-5 (Build & Type Integrity)**: Zero TypeScript errors (`tsc --noEmit`), clean linting, and successful Next.js production build (`next build`).

---

## 4. User Stories & Acceptance Criteria

### User Story 1: Bilingual Switch & RTL Support
> *As a clinic receptionist or doctor, I want to use the application in English or Arabic with correct LTR/RTL layout, so that I can work comfortably in my preferred language.*
- **AC 1.1**: Selecting Arabic switches layout to RTL, changes text direction, and aligns elements naturally right-to-left.
- **AC 1.2**: Selecting English switches layout to LTR, resets element alignment, and preserves styling consistency.
- **AC 1.3**: Refreshing the page or opening a direct link retains the selected language.

### User Story 2: Enforcing Four-Part Names
> *As clinic management, I want patients to be registered with their complete 4-part names, so that medical records and patient identities are never confused.*
- **AC 2.1**: Entering "Mohamed Ahmed Ali" fails validation with a clear localized message stating at least 4 name parts are required.
- **AC 2.2**: Entering "Mohamed  Ahmed   Ali  Hassan " successfully normalizes whitespace to "Mohamed Ahmed Ali Hassan" and passes validation.
- **AC 2.3**: Selecting an existing patient with a previously registered name does not trigger re-entry or validation blockage.

### User Story 3: Color-Coded Appointment Types
> *As a receptionist and doctor, I want appointments to be visually distinguishable by type, so that I can immediately discern consultations from follow-ups or lab test reviews on the calendar and queue.*
- **AC 3.1**: In the booking form, the 5 appointment types are shown with colored badges. Selecting one visibly highlights it.
- **AC 3.2**: On the calendar and queue board, each appointment card/row renders its corresponding badge color.
- **AC 3.3**: Pre-existing appointments in the database render correctly with their designated color without crashing or showing blank types.

### User Story 4: Image Attachments During Booking
> *As a receptionist, I want to attach previous prescriptions, lab slips, or ID photos when booking an appointment, so the doctor can review them.*
- **AC 4.1**: Uploading JPEG, PNG, or WebP files displays instant image thumbnails.
- **AC 4.2**: Clicking the delete button on a preview thumbnail removes it before submission.
- **AC 4.3**: Attempting to upload an executable, PDF (in image field), or oversized file (>5MB) fails with an informative error.
- **AC 4.4**: Saved attachments appear in appointment details and visit screens.

### User Story 5: Existing Patient Summary in Booking Page
> *As a receptionist booking a visit for a returning patient, I want to immediately see their last visit date, doctor, and outstanding balance on the booking page, so that I can inform them of pending fees and schedule appropriately.*
- **AC 5.1**: Searching and selecting an existing patient loads their basic info, last visit details, and financial summary within the page.
- **AC 5.2**: If the patient owes money from a previous appointment, the outstanding balance is prominently shown in amber/red.
- **AC 5.3**: Switching patients clears previous patient data completely and loads the new patient's history.
