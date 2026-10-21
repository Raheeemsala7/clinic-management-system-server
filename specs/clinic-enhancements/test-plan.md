# Test Plan & Verification Strategy: Clinic Management System Enhancements

## 1. Objectives & Scope

This document defines the comprehensive test strategy to verify all enhancements across localization, patient validation, color-coded appointment types, image attachments, existing patient history inspection, and the dedicated booking page.

Verification spans:
1. **Unit & Validation Tests**: 4-part name validation, file signature detection, color badge mapping.
2. **Integration & API Tests**: Booking summary endpoint, upload API, appointment creation & editing.
3. **End-to-End & UI Verification**: Complete booking workflow in both Arabic (RTL) and English (LTR).
4. **Typecheck & Production Build**: `tsc --noEmit` and `next build`.

---

## 2. Test Scenarios

### T-1: Localization & RTL/LTR Layout Tests
| Test ID | Scenario | Expected Behavior |
|---|---|---|
| **LOC-01** | Default language | Visiting app without locale preference selects English (`en`) with `dir="ltr"`. |
| **LOC-02** | Language switch to Arabic | Clicking Arabic in language switcher switches UI to Arabic (`ar`), updates document to `dir="rtl"`, and renders Arabic typography. |
| **LOC-03** | Language switch to English | Switching back to English updates document to `dir="ltr"` and renders English typography without visual anomalies. |
| **LOC-04** | Persistence on refresh | Reloading the browser preserves the active language and direction. |
| **LOC-05** | Form & validation messages | Validation errors, toast notifications, confirmation dialogs, and button labels render in the active language without hardcoded remnants. |
| **LOC-06** | Formatting | Dates, times, numbers, and currency format accurately according to active locale. |

### T-2: Patient Four-Part Name Validation Tests
| Test ID | Scenario | Input | Expected Result |
|---|---|---|---|
| **NAME-01** | Exactly 4 parts | `Ahmed Mohamed Ali Hassan` | Valid (passes validation). |
| **NAME-02** | 5 parts | `Ahmed Mohamed Ali Hassan Ibrahim` | Valid (passes validation). |
| **NAME-03** | 3 parts | `Ahmed Mohamed Ali` | Rejected (error: at least 4 name parts required). |
| **NAME-04** | 2 parts | `Ahmed Mohamed` | Rejected (error: at least 4 name parts required). |
| **NAME-05** | Single word / empty | `Ahmed` or `   ` | Rejected. |
| **NAME-06** | Irregular whitespace | `  Ahmed   Mohamed    Ali   Hassan  ` | Whitespace normalized to single spaces; passes validation. |
| **NAME-07** | Backend enforcement | Direct POST to `/api/v1/patients` with 3 parts | Returns `400 Bad Request` with `FULL_NAME_FOUR_PARTS_REQUIRED`. |
| **NAME-08** | Existing patient selection | Selecting previously registered patient | Reuses existing name without triggering re-entry or corruption. |

### T-3: Five Color-Coded Appointment Types Tests
| Test ID | Scenario | Verification |
|---|---|---|
| **TYPE-01** | All 5 types available | Examination, Follow-up Visit, Post-operative Follow-up, Lab Tests & Imaging, Test Results Review selectable in booking page. |
| **TYPE-02** | Distinct colors | Examination (Blue), Follow-up (Green), Post-operative (Purple), Lab/Imaging (Orange), Review (Teal). |
| **TYPE-03** | Color consistency | The same appointment type displays identical color badge on calendar, queue board, appointments table, and patient history. |
| **TYPE-04** | Accessibility & contrast | Badges display readable text on tinted backgrounds meeting WCAG AA contrast standards. |
| **TYPE-05** | Backward compatibility | Existing appointments with legacy `CONSULTATION` type render seamlessly as Examination (Blue). |

### T-4: Image Attachments in Booking Tests
| Test ID | Scenario | Expected Result |
|---|---|---|
| **IMG-01** | Valid JPEG/PNG/WebP upload | File displays thumbnail preview with name and size. |
| **IMG-02** | Multiple images staging | Up to 5 images can be staged simultaneously. |
| **IMG-03** | Remove staged preview | Clicking trash icon removes image from submission list. |
| **IMG-04** | Unsupported file format | Uploading `.exe`, `.txt`, `.pdf` (in image field) displays clear localized rejection error. |
| **IMG-05** | Oversized file | Uploading image > 5 MB displays size limit error. |
| **IMG-06** | Exceeding max count | Attempting to attach more than 5 images alerts user. |
| **IMG-07** | Server magic-byte validation | File with spoofed `.jpg` extension containing non-image bytes is rejected with 400. |
| **IMG-08** | Edit preservation | Editing an appointment keeps existing attachments intact unless explicitly removed. |

### T-5: Existing Patient Selection & Summary Panel Tests
| Test ID | Scenario | Expected Result |
|---|---|---|
| **HIST-01** | Patient search | Typing name or phone number triggers debounced server search and lists matching patients. |
| **HIST-02** | Selection triggers panel | Selecting a patient renders Patient Summary Panel immediately without full reload. |
| **HIST-03** | Basic information | Displays full 4-part name, phone, age, gender, date of birth, address, and ID. |
| **HIST-04** | Last visit details | Shows most recent visit date, color-coded type badge, doctor name, and diagnosis. |
| **HIST-05** | Financial balance | Shows total fees, amount paid, and outstanding balance (highlighted if unpaid/partial). |
| **HIST-06** | Previous visits | Shows recent appointment dates, types, and statuses. |
| **HIST-07** | Patient with zero history | Displays clean, friendly empty state ("No previous visits on record"). |
| **HIST-08** | Change patient | Clicking "Change Patient" clears data cleanly and allows new selection without stale leftovers. |

### T-6: Dedicated Booking Page Integration Tests
| Test ID | Scenario | Expected Result |
|---|---|---|
| **PAGE-01** | Dedicated URL navigation | Clicking "New Booking" opens `/reception/appointments/new` (or `/admin/appointments/new`). |
| **PAGE-02** | 6 Logical sections | Page renders: 1) Patient, 2) Type, 3) Schedule, 4) Images, 5) Financials, 6) Summary. |
| **PAGE-03** | Responsive layout | Form flows cleanly on desktop (multi-column) and mobile/tablet (single column). |
| **PAGE-04** | Complete creation flow | Creating a booking saves appointment, patient association, type, financial records, and attachments. |
| **PAGE-05** | Redirection & Toast | Upon successful booking, redirects to appointments view with localized success notification. |

---

## 3. Automated Verification Checklist

```bash
# 1. Server tests
cd server
npm test

# 2. Server TypeScript check
npx tsc --noEmit

# 3. Client TypeScript check
cd ../client
pnpm type-check

# 4. Client Production Build
pnpm build
```
