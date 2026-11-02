import { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

/**
 * مواصفات OpenAPI 3.0 لنظام إدارة عيادة د. إسلام عبدالله كريمة
 * متوافقة مع نمط الاستجابة الموحد (Standard Response Envelope):
 * Success: { status: true, code: 200, message?: string, payload: T, metadata?: { page, limit, total, totalPages } }
 * Error:   { status: false, code: 400, message?: string, errors?: [{ path, message }] }
 */
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Clinic Management System API — د. إسلام عبدالله كريمة',
    version: '1.0.0',
    description: `
## واجهة برمجة التطبيقات (API) لنظام إدارة عيادة الأنف والأذن والحنجرة
توفر هذه الواجهة كافة الخدمات لإدارة:
- **المصادقة وتذاكر Socket (Auth & Socket Ticket)**: تسجيل الدخول بنظام JWT، الصلاحيات (Admin, Doctor, Reception)، وتذاكر الاتصال اللحظي.
- **المرضى (Patients)**: السجلات الطبية، البحث بالاسم الرباعي والهاتف، الأمراض المزمنة (chronicConditions: string[])، والحساسية.
- **المواعيد (Appointments & Scheduling)**: الحجز، دورة حياة الكشف (وصول، بدء، إنهاء، إلغاء، تأجيل، دفع متبقي).
- **جدول الطبيب وقائمة الانتظار (Doctor Schedule & Queue)**: المواعيد المتاحة، فترات العمل، وإدارة صالة الانتظار المباشرة.
- **الكشوفات والروشتات (Visits & Prescriptions)**: التشخيص، الحفظ التلقائي (Autosave)، دليل الأدوية، وقوالب الروشتات الجاهزة.
- **المالية والمصروفات (Payments & Expenses)**: الفواتير، بنود المصروفات، والتقفيل المالي اليومي للخزينة (Daily Closing).
- **التقارير والمراجعة (Reports & Audit Logs)**: ملخصات الدخل والمصروفات وسجلات التدقيق والأمان.
- **المرفقات (Attachments)**: رفع وتحميل صور وفحوصات المرضى.

### معيار الاستجابة الموحد (Response Envelope Structure):
- **نجاح العملية (Success):**
\`\`\`json
{
  "status": true,
  "code": 200,
  "message": "Operation completed successfully",
  "payload": { ... },
  "metadata": {
    "page": "1",
    "limit": "20",
    "total": "45",
    "totalPages": "3"
  }
}
\`\`\`
- **فشل العملية أو خطأ تحقق (Error / Validation):**
\`\`\`json
{
  "status": false,
  "code": 400,
  "message": "Validation failed",
  "errors": [
    { "path": "fullName", "message": "يجب إدخال اسم المريض رباعياً على الأقل" }
  ]
}
\`\`\`
    `,
    contact: {
      name: 'د. إسلام عبدالله كريمة - ENT Clinic',
      url: 'http://localhost:3000',
    },
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local Development Server (Port 4000)',
    },
    {
      url: '/',
      description: 'Current Environment / Production Relative',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'أدخل رمز الـ JWT Access Token الخاص بك (مثال: Bearer eyJhbGciOi...)',
      },
    },
    schemas: {
      // 1. Generic Response Envelopes
      SuccessResponseEnvelope: {
        type: 'object',
        properties: {
          status: { type: 'boolean', example: true },
          code: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Operation completed successfully' },
          payload: { type: 'object', description: 'البيانات المعادة للطلب' },
          metadata: {
            type: 'object',
            properties: {
              page: { type: 'string', example: '1' },
              limit: { type: 'string', example: '20' },
              total: { type: 'string', example: '50' },
              totalPages: { type: 'string', example: '3' },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'boolean', example: false },
          code: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'بيانات غير صالحة' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string', example: 'fullName' },
                message: { type: 'string', example: 'حقل الاسم رباعي مطلوب' },
              },
            },
          },
        },
      },

      // 2. Auth Schemas
      LoginDto: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'Admin@123' },
        },
      },
      RefreshTokenDto: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'd09f7a63445b98...' },
        },
      },
      SocketTicketPayload: {
        type: 'object',
        properties: {
          ticket: { type: 'string', example: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6' },
          expiresInSeconds: { type: 'integer', example: 30 },
        },
      },

      // 3. User Schemas
      UserDto: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65f123456789abcdef012345' },
          name: { type: 'string', example: 'د. إسلام عبدالله كريمة' },
          username: { type: 'string', example: 'doctor' },
          role: { type: 'string', enum: ['ADMIN', 'DOCTOR', 'RECEPTION'], example: 'DOCTOR' },
          isActive: { type: 'boolean', example: true },
          lastLoginAt: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateUserDto: {
        type: 'object',
        required: ['name', 'username', 'password', 'role'],
        properties: {
          name: { type: 'string', example: 'أحمد الاستقبال' },
          username: { type: 'string', example: 'reception1' },
          password: { type: 'string', example: 'Secret@123' },
          role: { type: 'string', enum: ['ADMIN', 'DOCTOR', 'RECEPTION'], example: 'RECEPTION' },
        },
      },
      UpdateUserDto: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'أحمد محمود الاستقبال' },
          role: { type: 'string', enum: ['ADMIN', 'DOCTOR', 'RECEPTION'], example: 'RECEPTION' },
          isActive: { type: 'boolean', example: true },
        },
      },
      ResetPasswordDto: {
        type: 'object',
        required: ['newPassword'],
        properties: {
          newPassword: { type: 'string', example: 'NewPassword@123' },
        },
      },

      // 4. Patient Schemas
      PatientDto: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'c0a80123-4567-89ab-cdef-0123456789ab' },
          fullName: { type: 'string', example: 'محمد أحمد محمود علي' },
          phone: { type: 'string', example: '01012345678' },
          gender: { type: 'string', enum: ['MALE', 'FEMALE'], example: 'MALE' },
          age: { type: 'number', example: 34 },
          dateOfBirth: { type: 'string', format: 'date', example: '1990-05-14' },
          address: { type: 'string', example: 'القاهرة - المعادي' },
          allergies: {
            type: 'array',
            items: { type: 'string' },
            example: ['حساسية بنسلين', 'حساسية أسبرين'],
          },
          chronicConditions: {
            type: 'array',
            description: 'قائمة الأمراض المزمنة للمريض (مثل: ضغط، سكر، ربو)',
            items: { type: 'string' },
            example: ['الضغط', 'السكر'],
          },
          generalNotes: { type: 'string', example: 'يعاني من صداع نصفي مزمن' },
          createdById: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreatePatientDto: {
        type: 'object',
        required: ['fullName', 'phone', 'gender'],
        properties: {
          fullName: {
            type: 'string',
            description: 'الاسم رباعي باللغة العربية على الأقل',
            example: 'محمد أحمد محمود علي',
          },
          phone: { type: 'string', example: '01012345678' },
          gender: { type: 'string', enum: ['MALE', 'FEMALE'], example: 'MALE' },
          age: { type: 'number', example: 34 },
          dateOfBirth: { type: 'string', format: 'date', example: '1990-05-14' },
          address: { type: 'string', example: 'القاهرة - المعادي' },
          allergies: {
            type: 'array',
            items: { type: 'string' },
            example: ['حساسية بنسلين'],
          },
          chronicConditions: {
            type: 'array',
            description: 'الأمراض المزمنة كمصفوفة نصوص',
            items: { type: 'string' },
            example: ['الضغط', 'السكر'],
          },
          generalNotes: { type: 'string', example: 'ملاحظات إضافية' },
        },
      },
      UpdatePatientDto: {
        type: 'object',
        properties: {
          fullName: { type: 'string', example: 'محمد أحمد محمود علي' },
          phone: { type: 'string', example: '01012345678' },
          gender: { type: 'string', enum: ['MALE', 'FEMALE'], example: 'MALE' },
          age: { type: 'number', example: 35 },
          dateOfBirth: { type: 'string', format: 'date', example: '1990-05-14' },
          address: { type: 'string', example: 'القاهرة - المعادي الجديدة' },
          allergies: {
            type: 'array',
            items: { type: 'string' },
            example: ['بنسلين'],
          },
          chronicConditions: {
            type: 'array',
            items: { type: 'string' },
            example: ['الضغط', 'السكر'],
          },
          generalNotes: { type: 'string', example: 'تم تحديث التاريخ الطبي' },
        },
      },

      // 5. Appointment Schemas
      AppointmentDto: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'apt-0123456789' },
          patientId: { type: 'string', example: 'pat-0123456789' },
          doctorId: { type: 'string', example: 'doc-0123456789' },
          clinicDate: { type: 'string', example: '2026-11-02' },
          source: { type: 'string', enum: ['SCHEDULED', 'WALK_IN'], example: 'SCHEDULED' },
          scheduledAt: { type: 'string', format: 'date-time' },
          type: {
            type: 'string',
            enum: ['EXAMINATION', 'FOLLOW_UP', 'POST_OPERATIVE', 'LAB_TESTS_IMAGING', 'TEST_RESULTS_REVIEW', 'CONSULTATION'],
            example: 'EXAMINATION',
          },
          status: {
            type: 'string',
            enum: ['BOOKED', 'WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
            example: 'BOOKED',
          },
          queueNumber: { type: 'integer', example: 5 },
          queueOrder: { type: 'integer', example: 5 },
          postponedCount: { type: 'integer', example: 0 },
          totalAmount: { type: 'number', example: 300 },
          paidAmount: { type: 'number', example: 300 },
          remainingAmount: { type: 'number', example: 0 },
          paymentStatus: { type: 'string', enum: ['PAID', 'PARTIAL', 'UNPAID', 'EXEMPT'], example: 'PAID' },
          isExempt: { type: 'boolean', example: false },
          notes: { type: 'string', example: 'فحص أنف وأذن' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateAppointmentDto: {
        type: 'object',
        required: ['patientId', 'doctorId', 'clinicDate', 'type'],
        properties: {
          patientId: { type: 'string', example: 'pat-0123456789' },
          doctorId: { type: 'string', example: 'doc-0123456789' },
          clinicDate: { type: 'string', example: '2026-11-02' },
          source: { type: 'string', enum: ['SCHEDULED', 'WALK_IN'], default: 'SCHEDULED' },
          scheduledAt: { type: 'string', format: 'date-time', example: '2026-11-02T16:30:00.000Z' },
          type: {
            type: 'string',
            enum: ['EXAMINATION', 'FOLLOW_UP', 'POST_OPERATIVE', 'LAB_TESTS_IMAGING', 'TEST_RESULTS_REVIEW', 'CONSULTATION'],
            example: 'EXAMINATION',
          },
          totalAmount: { type: 'number', example: 300 },
          paidAmount: { type: 'number', example: 300 },
          isExempt: { type: 'boolean', example: false },
          exemptionReason: { type: 'string', example: 'حالة إنسانية' },
          notes: { type: 'string', example: 'شكوى من التهاب الأذن الوسطى' },
        },
      },
      PayRemainingDto: {
        type: 'object',
        required: ['amount', 'method'],
        properties: {
          amount: { type: 'number', example: 100 },
          method: { type: 'string', enum: ['CASH', 'CARD', 'WALLET'], example: 'CASH' },
          notes: { type: 'string', example: 'سداد المتبقي' },
        },
      },

      // 6. Doctor Schedule Schemas
      DoctorScheduleDto: {
        type: 'object',
        properties: {
          doctorId: { type: 'string', example: 'doc-123' },
          slotDurationMinutes: { type: 'integer', example: 30 },
          weeklySchedule: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                dayOfWeek: { type: 'integer', minimum: 0, maximum: 6, example: 0, description: '0=الأحد, 6=السبت' },
                isAvailable: { type: 'boolean', example: true },
                shifts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      startTime: { type: 'string', example: '09:00' },
                      endTime: { type: 'string', example: '14:00' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      DoctorStatusDto: {
        type: 'object',
        properties: {
          doctorId: { type: 'string' },
          status: { type: 'string', enum: ['AVAILABLE', 'BUSY', 'ON_BREAK', 'OFFLINE'], example: 'AVAILABLE' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // 7. Visit Schemas
      VisitDto: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'vis-123' },
          appointmentId: { type: 'string', example: 'apt-123' },
          patientId: { type: 'string', example: 'pat-123' },
          doctorId: { type: 'string', example: 'doc-123' },
          complaint: { type: 'string', example: 'ألم مستمر في الأذن اليمنى وصداع' },
          diagnosis: { type: 'string', example: 'التهاب حاد في الأذن الوسطى (Otitis media)' },
          notes: { type: 'string', example: 'لا توجد إفرازات حالياً' },
          instructions: { type: 'string', example: 'تجنب دخول الماء للأذن' },
          followUpDate: { type: 'string', format: 'date', example: '2026-11-09' },
          status: { type: 'string', enum: ['OPEN', 'CLOSED'], example: 'OPEN' },
          version: { type: 'integer', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AutosaveVisitDto: {
        type: 'object',
        properties: {
          complaint: { type: 'string', example: 'ألم حاد بالحلق' },
          diagnosis: { type: 'string', example: 'التهاب لوزتين صديدي' },
          notes: { type: 'string', example: 'حرارة 38.5' },
          instructions: { type: 'string', example: 'الراحة والإكثار من السوائل الدافئة' },
          followUpDate: { type: 'string', format: 'date', example: '2026-11-10' },
          version: { type: 'integer', example: 1 },
        },
      },

      // 8. Prescription Schemas
      PrescriptionItemDto: {
        type: 'object',
        required: ['drugName', 'dose', 'frequency', 'duration'],
        properties: {
          id: { type: 'string' },
          drugName: { type: 'string', example: 'Augmentin 1gm' },
          dose: { type: 'string', example: 'قرص واحد' },
          frequency: { type: 'string', example: 'كل 12 ساعة بعد الأكل' },
          duration: { type: 'string', example: '7 أيام' },
          instructions: { type: 'string', example: 'إكمال الكورس كاملاً' },
          sortOrder: { type: 'integer', example: 1 },
        },
      },
      PrescriptionDto: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'rx-123' },
          visitId: { type: 'string', example: 'vis-123' },
          patientId: { type: 'string', example: 'pat-123' },
          doctorId: { type: 'string', example: 'doc-123' },
          versionNumber: { type: 'integer', example: 1 },
          notes: { type: 'string', example: 'ملاحظات الصيدلي' },
          printedAt: { type: 'string', format: 'date-time' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/PrescriptionItemDto' },
          },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreatePrescriptionTemplateDto: {
        type: 'object',
        required: ['name', 'items'],
        properties: {
          name: { type: 'string', example: 'بروتوكول التهاب الأذن الوسطى' },
          notes: { type: 'string', example: 'روشتة نموذجية لحالات الأذن' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/PrescriptionItemDto' },
          },
        },
      },

      // 9. Drugs
      DrugDto: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          tradeName: { type: 'string', example: 'Panadol Extra' },
          genericName: { type: 'string', example: 'Paracetamol + Caffeine' },
          form: { type: 'string', example: 'Tablets' },
          defaultDose: { type: 'string', example: 'قرصين' },
          defaultFrequency: { type: 'string', example: 'عند اللزوم' },
          defaultDuration: { type: 'string', example: '3 أيام' },
        },
      },

      // 10. Financials (Payments, Expenses, Closing)
      RecordPaymentDto: {
        type: 'object',
        required: ['amount', 'method', 'kind'],
        properties: {
          amount: { type: 'number', example: 300 },
          method: { type: 'string', enum: ['CASH', 'CARD', 'WALLET'], example: 'CASH' },
          kind: {
            type: 'string',
            enum: ['EXAMINATION', 'FOLLOW_UP', 'POST_OPERATIVE', 'LAB_TESTS_IMAGING', 'TEST_RESULTS_REVIEW', 'CONSULTATION', 'OTHER'],
            example: 'EXAMINATION',
          },
          paymentType: { type: 'string', enum: ['FULL', 'DEPOSIT', 'REMAINING', 'OTHER'], default: 'FULL' },
          notes: { type: 'string', example: 'تم الدفع بالخزينة نقدياً' },
        },
      },
      PaymentDto: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          appointmentId: { type: 'string' },
          patientId: { type: 'string' },
          amount: { type: 'number', example: 300 },
          method: { type: 'string', enum: ['CASH', 'CARD', 'WALLET'], example: 'CASH' },
          kind: { type: 'string', example: 'EXAMINATION' },
          paymentType: { type: 'string', example: 'FULL' },
          status: { type: 'string', enum: ['RECORDED', 'VOIDED'], example: 'RECORDED' },
          voidReason: { type: 'string' },
          receivedById: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      VoidPaymentDto: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: { type: 'string', example: 'تم إدخال الإيصال بالخطأ' },
        },
      },
      ExpenseCategoryDto: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'مستلزمات طبية وتطهير' },
          isActive: { type: 'boolean', example: true },
        },
      },
      CreateExpenseDto: {
        type: 'object',
        required: ['categoryId', 'amount', 'description'],
        properties: {
          categoryId: { type: 'string', example: 'cat-123' },
          amount: { type: 'number', example: 250 },
          description: { type: 'string', example: 'شراء كحول وشاش وأقنعة' },
          spentAt: { type: 'string', format: 'date-time' },
        },
      },
      ExpenseDto: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          categoryId: { type: 'string' },
          amount: { type: 'number', example: 250 },
          description: { type: 'string', example: 'شراء قفازات طبية' },
          spentAt: { type: 'string', format: 'date-time' },
          recordedById: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'], example: 'APPROVED' },
          reviewedById: { type: 'string' },
          rejectionReason: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      DailyClosingDto: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          clinicDate: { type: 'string', example: '2026-11-02' },
          expectedCash: { type: 'number', example: 3500 },
          actualCash: { type: 'number', example: 3500 },
          difference: { type: 'number', example: 0 },
          notes: { type: 'string', example: 'مطابق تماماً' },
          closedById: { type: 'string' },
          closedAt: { type: 'string', format: 'date-time' },
          reopenedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateDailyClosingDto: {
        type: 'object',
        required: ['clinicDate', 'actualCash'],
        properties: {
          clinicDate: { type: 'string', example: '2026-11-02' },
          actualCash: { type: 'number', example: 3500 },
          notes: { type: 'string', example: 'تم جرد الخزينة بواسطة الاستقبال' },
        },
      },

      // 11. Reports & Settings & Audit
      ReportSummaryDto: {
        type: 'object',
        properties: {
          totalRevenue: { type: 'number', example: 12500 },
          totalExpenses: { type: 'number', example: 1800 },
          netIncome: { type: 'number', example: 10700 },
          appointmentsCount: { type: 'integer', example: 42 },
          patientsCount: { type: 'integer', example: 38 },
        },
      },
      SettingDto: {
        type: 'object',
        properties: {
          clinicName: { type: 'string', example: 'عيادة د. إسلام عبدالله كريمة' },
          doctorTitle: { type: 'string', example: 'استشاري الأنف والأذن والحنجرة' },
          defaultExaminationFee: { type: 'number', example: 300 },
          defaultConsultationFee: { type: 'number', example: 150 },
          consultationGraceDays: { type: 'integer', example: 14 },
          phone: { type: 'string', example: '+20 10 50792622' },
          address: { type: 'string', example: 'المعادي - القاهرة' },
        },
      },
      AuditLogDto: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          action: { type: 'string', example: 'PATIENT_CREATE' },
          entity: { type: 'string', example: 'Patient' },
          entityId: { type: 'string' },
          actorId: { type: 'string' },
          details: { type: 'object' },
          ip: { type: 'string', example: '127.0.0.1' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      AttachmentUploadDto: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'audiogram-report.pdf' },
          data: { type: 'string', description: 'Base64 encoded file string' },
          files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'scan.jpg' },
                data: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Health', description: 'فحص صحة الخادم وقاعدة البيانات' },
    { name: 'Auth', description: 'المصادقة، تسجيل الدخول، تجديد الرمز، وتذاكر WebSocket' },
    { name: 'Users', description: 'إدارة المستخدمين والأطباء وموظفي الاستقبال (Admin Only)' },
    { name: 'Patients', description: 'إدارة المرضى، البحث، التاريخ الطبي، والأمراض المزمنة' },
    { name: 'Appointments', description: 'إدارة الحجوزات، المواعيد، وتغيير حالات الكشف والدفع' },
    { name: 'Doctor Schedule', description: 'أوقات وفترات عمل الطبيب والفتحات المتاحة للحجز' },
    { name: 'Queue', description: 'إدارة طابور صالة الانتظار وحالة الطبيب اللحظية' },
    { name: 'Visits', description: 'سجلات الكشف الطبي، الحفظ التلقائي (Autosave)، وإنهاء الزيارة' },
    { name: 'Prescriptions', description: 'طباعة الروشتات، قوالب الأدوية المجهزة، وسجل العلاج' },
    { name: 'Drugs', description: 'البحث في دليل أدوية العيادة' },
    { name: 'Payments', description: 'سجل المدفوعات، سندات القبض، وإلغاء العمليات' },
    { name: 'Expenses', description: 'إدارة وتصنيف المصروفات واعتمادها من الإدارة' },
    { name: 'Daily Closing', description: 'التقفيل المالي اليومي، مطابقة النقدية، وإعادة الفتح' },
    { name: 'Reports', description: 'التقارير الإحصائية المالية والتشغيلية' },
    { name: 'Settings', description: 'إعدادات العيادة، أسعار الكشف، وأيام الاستشارة' },
    { name: 'Audit Logs', description: 'سجلات التدقيق الأمني لعمليات النظام' },
    { name: 'Attachments', description: 'رفع وعرض ملفات وفحوصات المرضى' },
  ],
  paths: {
    // ==========================================
    // HEALTH
    // ==========================================
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'فحص جاهزية الخادم وقاعدة البيانات',
        responses: {
          200: {
            description: 'السيرفر يعمل بكفاءة',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        service: { type: 'string', example: 'Clinic Management API (Express + MongoDB)' },
                        version: { type: 'string', example: '1.0.0' },
                        documentation: { type: 'string', example: '/api-docs' },
                        timestamp: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==========================================
    // AUTH
    // ==========================================
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'تسجيل الدخول للنظام والحصول على JWT Access & Refresh Tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginDto' } },
          },
        },
        responses: {
          200: {
            description: 'تم تسجيل الدخول بنجاح',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Logged in successfully' },
                    payload: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserDto' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                        expiresIn: { type: 'integer', example: 900 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'اسم المستخدم أو كلمة المرور غير صحيحة',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
          422: {
            description: 'أخطاء التحقق من المدخلات',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'تجديد الـ Access Token باستخدام الـ Refresh Token',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenDto' } },
          },
        },
        responses: {
          200: {
            description: 'تم تجديد الرمز بنجاح',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                        expiresIn: { type: 'integer', example: 900 },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'الرمز غير صالح أو منتهي الصلاحية' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'تسجيل الخروج وإبطال الـ Refresh Token',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'تم تسجيل الخروج بنجاح',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'الحصول على بيانات المستخدم الحالي المسجل دخوله',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'بيانات المستخدم الحالي',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { $ref: '#/components/schemas/UserDto' },
                  },
                },
              },
            },
          },
          401: { description: 'غير مصرح به' },
        },
      },
    },
    '/api/v1/auth/socket-ticket': {
      post: {
        tags: ['Auth'],
        summary: 'الحصول على تذكرة مشفرة صالحة لمدة قصيرة للاتصال بـ Socket.IO',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'تذكرة الاتصال المؤقتة',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { $ref: '#/components/schemas/SocketTicketPayload' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==========================================
    // USERS
    // ==========================================
    '/api/v1/users/doctors': {
      get: {
        tags: ['Users'],
        summary: 'الحصول على قائمة الأطباء النشطين في العيادة',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'قائمة الأطباء',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/UserDto' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/users': {
      get: {
        tags: ['Users'],
        summary: 'عرض جميع مستخدمي النظام (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'قائمة المستخدمين',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/UserDto' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'إنشاء حساب مستخدم جديد (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateUserDto' } },
          },
        },
        responses: {
          201: {
            description: 'تم إنشاء المستخدم بنجاح',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 201 },
                    message: { type: 'string', example: 'User created successfully' },
                    payload: { $ref: '#/components/schemas/UserDto' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/users/{id}': {
      put: {
        tags: ['Users'],
        summary: 'تعديل بيانات مستخدم (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateUserDto' } },
          },
        },
        responses: {
          200: {
            description: 'تم تحديث البيانات',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { $ref: '#/components/schemas/UserDto' },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'تعطيل حساب مستخدم (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تم تعطيل الحساب بنجاح',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/users/{id}/reset-password': {
      post: {
        tags: ['Users'],
        summary: 'إعادة تعيين كلمة مرور مستخدم (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordDto' } },
          },
        },
        responses: {
          200: {
            description: 'تمت إعادة تعيين كلمة المرور',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },

    // ==========================================
    // PATIENTS
    // ==========================================
    '/api/v1/patients': {
      get: {
        tags: ['Patients'],
        summary: 'البحث عن المرضى بالاسم الرباعي أو رقم الهاتف مع دعم Pagination',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'query', in: 'query', schema: { type: 'string' }, description: 'نص البحث (اسم أو هاتف)' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'نتائج البحث عن المرضى',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/PatientDto' },
                    },
                    metadata: {
                      type: 'object',
                      properties: {
                        page: { type: 'string', example: '1' },
                        limit: { type: 'string', example: '20' },
                        total: { type: 'string', example: '100' },
                        totalPages: { type: 'string', example: '5' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Patients'],
        summary: 'تسجيل مريض جديد (مع مصفوفة الأمراض المزمنة chronicConditions والاسم الرباعي)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreatePatientDto' } },
          },
        },
        responses: {
          201: {
            description: 'تم تسجيل المريض بنجاح',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 201 },
                    message: { type: 'string', example: 'Patient created successfully' },
                    payload: { $ref: '#/components/schemas/PatientDto' },
                  },
                },
              },
            },
          },
          400: {
            description: 'خطأ تحقق - الاسم ليس رباعياً أو الهاتف مكرر',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/v1/patients/{id}': {
      get: {
        tags: ['Patients'],
        summary: 'عرض الملف الكامل لمريض معين',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'بيانات المريض',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { $ref: '#/components/schemas/PatientDto' },
                  },
                },
              },
            },
          },
          404: { description: 'المريض غير موجود' },
        },
      },
      put: {
        tags: ['Patients'],
        summary: 'تحديث بيانات مريض (الاسم، الهاتف، الأمراض المزمنة، إلخ)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdatePatientDto' } },
          },
        },
        responses: {
          200: {
            description: 'تم التحديث بنجاح',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    message: { type: 'string', example: 'Patient updated successfully' },
                    payload: { $ref: '#/components/schemas/PatientDto' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/patients/{id}/history': {
      get: {
        tags: ['Patients'],
        summary: 'السجل الطبي الكامل للمريض (زيارات سابقة، تشخيصات، وروشتات)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'السجل الطبي الكامل',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'object',
                      properties: {
                        patient: { $ref: '#/components/schemas/PatientDto' },
                        visits: { type: 'array', items: { type: 'object' } },
                        appointments: { type: 'array', items: { type: 'object' } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/patients/{id}/summary': {
      get: {
        tags: ['Patients'],
        summary: 'ملخص طبي سريع للمريض (للطبيب والمدير فقط)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'الملخص الطبي',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/patients/{id}/booking-summary': {
      get: {
        tags: ['Patients'],
        summary: 'ملخص الحجوزات السابقة وموقف المدفوعات والزيارات الأخيرة للمريض',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'ملخص الحجوزات',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },

    // ==========================================
    // APPOINTMENTS
    // ==========================================
    '/api/v1/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'استعراض الحجوزات مع إمكانية التصفية باليوم والطبيب والحالة',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string' }, description: 'YYYY-MM-DD' },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'doctorId', in: 'query', schema: { type: 'string' } },
          { name: 'patientId', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'قائمة الحجوزات',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AppointmentDto' },
                    },
                    metadata: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Appointments'],
        summary: 'حجز موعد كشف أو استشارة جديد للمريض',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateAppointmentDto' } },
          },
        },
        responses: {
          201: {
            description: 'تم الحجز بنجاح وإصدار رقم الطابور',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 201 },
                    message: { type: 'string', example: 'Appointment created successfully' },
                    payload: { $ref: '#/components/schemas/AppointmentDto' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/appointments/{id}': {
      get: {
        tags: ['Appointments'],
        summary: 'عرض تفاصيل موعد معين مع بيانات المريض والدفع',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تفاصيل الموعد',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { $ref: '#/components/schemas/AppointmentDto' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Appointments'],
        summary: 'تعديل بيانات حجز موجود',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تم تعديل الحجز بنجاح',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/appointments/{id}/arrive': {
      post: {
        tags: ['Appointments'],
        summary: 'تسجيل وصول المريض للعيادة ودخوله صالة الانتظار (ARRIVED/WAITING)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تم تسجيل الوصول',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/appointments/{id}/start': {
      post: {
        tags: ['Appointments'],
        summary: 'بدء الكشف ودخول المريض لغرفة الطبيب (IN_PROGRESS)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تم بدء الكشف وإنشاء سجل الزيارة Visit',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/appointments/{id}/complete': {
      post: {
        tags: ['Appointments'],
        summary: 'إنهاء الكشف وخروج المريض (COMPLETED)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تم إنهاء الكشف بنجاح',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/appointments/{id}/cancel': {
      post: {
        tags: ['Appointments'],
        summary: 'إلغاء الموعد (CANCELLED)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تم إلغاء الموعد',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/appointments/{id}/no-show': {
      post: {
        tags: ['Appointments'],
        summary: 'تسجيل عدم حضور المريض (NO_SHOW)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تم تسجيل عدم الحضور',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/appointments/{id}/postpone': {
      post: {
        tags: ['Appointments'],
        summary: 'تأجيل دور المريض في صالة الانتظار وإعادته للخلف',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تم تأجيل الدور بنجاح',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/appointments/{id}/pay-remaining': {
      post: {
        tags: ['Appointments'],
        summary: 'دفع المبلغ المتبقي من قيمة الكشف أو العملية',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/PayRemainingDto' } },
          },
        },
        responses: {
          200: {
            description: 'تم سداد المتبقي وتحديث حالة الدفع',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/appointments/{id}/payments': {
      post: {
        tags: ['Appointments', 'Payments'],
        summary: 'تسجيل دفعة نقدية أو إلكترونية على حجز معين',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/RecordPaymentDto' } },
          },
        },
        responses: {
          201: {
            description: 'تم تسجيل الدفعة بنجاح',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 201 },
                    payload: { $ref: '#/components/schemas/PaymentDto' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==========================================
    // DOCTOR SCHEDULE
    // ==========================================
    '/api/v1/doctor-schedule/{doctorId}': {
      get: {
        tags: ['Doctor Schedule'],
        summary: 'استعراض مواعيد وأيام عمل الطبيب الأسبوعية ومدة الكشف',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'جدول الطبيب',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { $ref: '#/components/schemas/DoctorScheduleDto' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Doctor Schedule'],
        summary: 'تحديث فترات ومواعيد عمل الطبيب الأسبوعية',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/DoctorScheduleDto' } },
          },
        },
        responses: {
          200: {
            description: 'تم تحديث جدول العمل بنجاح',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/doctor-schedule/{doctorId}/available-slots': {
      get: {
        tags: ['Doctor Schedule'],
        summary: 'حساب واستعراض الفترات المتاحة للحجز في تاريخ معين لطبيب معين',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'doctorId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'date', in: 'query', required: true, schema: { type: 'string' }, description: 'YYYY-MM-DD' },
        ],
        responses: {
          200: {
            description: 'الفتحات المتاحة',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'array',
                      items: { type: 'string', example: '10:30' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==========================================
    // QUEUE & DOCTOR STATUS
    // ==========================================
    '/api/v1/queue/today': {
      get: {
        tags: ['Queue'],
        summary: 'عرض قائمة الانتظار وصالة الكشف لليوم الحالي مرتبة حسب الدور',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'doctorId', in: 'query', schema: { type: 'string' }, description: 'معرف الطبيب (اختياري)' },
        ],
        responses: {
          200: {
            description: 'طابور اليوم وحالات المرضى الحالية',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'object',
                      properties: {
                        waiting: { type: 'array', items: { $ref: '#/components/schemas/AppointmentDto' } },
                        inProgress: { $ref: '#/components/schemas/AppointmentDto' },
                        completedCount: { type: 'integer', example: 12 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/doctor-status': {
      get: {
        tags: ['Queue'],
        summary: 'الحصول على حالة الطبيب الحالية (متاح، مشغول، استراحة، غير متصل)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'doctorId', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'حالة الطبيب الحالية',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { $ref: '#/components/schemas/DoctorStatusDto' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Queue'],
        summary: 'تحديث حالة الطبيب (للطبيب فقط)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['AVAILABLE', 'BUSY', 'ON_BREAK', 'OFFLINE'],
                    example: 'AVAILABLE',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'تم تحديث حالة الطبيب وبثها لحظياً للمصادقين',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },

    // ==========================================
    // VISITS
    // ==========================================
    '/api/v1/visits/{id}': {
      get: {
        tags: ['Visits'],
        summary: 'عرض تفاصيل الزيارة الطبية والتشخيص',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'بيانات الزيارة',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { $ref: '#/components/schemas/VisitDto' },
                  },
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Visits'],
        summary: 'الحفظ التلقائي اللحظي (Autosave) لبيانات الكشف والشكوى والتشخيص',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AutosaveVisitDto' } },
          },
        },
        responses: {
          200: {
            description: 'تم الحفظ التلقائي بنجاح مع زيادة رقم الإصدار Version',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { $ref: '#/components/schemas/VisitDto' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/visits/{id}/close': {
      post: {
        tags: ['Visits'],
        summary: 'إغلاق وقفل الزيارة الطبية بعد انتهاء الكشف لمنع التعديل غير المصرح',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تم إغلاق الزيارة بنجاح',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/visits/{id}/reopen': {
      post: {
        tags: ['Visits'],
        summary: 'إعادة فتح الزيارة الطبية للتعديل (للطبيب أو المدير)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تم إعادة فتح الزيارة',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/visits/{visitId}/prescriptions': {
      post: {
        tags: ['Visits', 'Prescriptions'],
        summary: 'إضافة روشتة أدوية للزيارة الطبية',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'visitId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['items'],
                properties: {
                  notes: { type: 'string', example: 'ملاحظات الروشتة' },
                  items: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/PrescriptionItemDto' },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'تم حفظ الروشتة بنجاح وجاهزة للطباعة',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 201 },
                    payload: { $ref: '#/components/schemas/PrescriptionDto' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==========================================
    // PRESCRIPTIONS
    // ==========================================
    '/api/v1/prescriptions/{id}': {
      get: {
        tags: ['Prescriptions'],
        summary: 'الحصول على بيانات الروشتة مهيأة للطباعة بجودة عالية',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'بيانات الروشتة جاهزة للعرض أو الطباعة',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { $ref: '#/components/schemas/PrescriptionDto' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/prescriptions/{id}/mark-printed': {
      post: {
        tags: ['Prescriptions'],
        summary: 'تسجيل تاريخ ووقت طباعة الروشتة',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تم تسجيل الطباعة بنجاح',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/patients/{patientId}/prescriptions': {
      get: {
        tags: ['Prescriptions'],
        summary: 'سجل جميع الروشتات السابقة لمريض معين',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'patientId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: 'قائمة الروشتات السابقة للمريض',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/PrescriptionDto' },
                    },
                    metadata: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/prescription-templates': {
      get: {
        tags: ['Prescriptions'],
        summary: 'عرض قوالب الروشتات الجاهزة الخاصة بالطبيب',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'قائمة القوالب',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Prescriptions'],
        summary: 'حفظ قالب روشتة جديد لاستخدامه السريع في الكشوفات',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreatePrescriptionTemplateDto' } },
          },
        },
        responses: {
          201: {
            description: 'تم إنشاء القالب بنجاح',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/prescription-templates/{id}': {
      delete: {
        tags: ['Prescriptions'],
        summary: 'حذف قالب روشتة',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'تم الحذف بنجاح' },
        },
      },
    },

    // ==========================================
    // DRUGS
    // ==========================================
    '/api/v1/drugs': {
      get: {
        tags: ['Drugs'],
        summary: 'البحث السريع في دليل الأدوية بالاسم التجاري أو العلمي',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' }, description: 'اسم الدواء للبحث' },
        ],
        responses: {
          200: {
            description: 'نتائج البحث عن الأدوية',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DrugDto' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==========================================
    // PAYMENTS
    // ==========================================
    '/api/v1/payments': {
      get: {
        tags: ['Payments'],
        summary: 'استعراض سجل المدفوعات والإيصالات المالية',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string' } },
          { name: 'patientId', in: 'query', schema: { type: 'string' } },
          { name: 'method', in: 'query', schema: { type: 'string', enum: ['CASH', 'CARD', 'WALLET'] } },
          { name: 'kind', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'قائمة المدفوعات',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/PaymentDto' },
                    },
                    metadata: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/payments/{id}/void': {
      post: {
        tags: ['Payments'],
        summary: 'إلغاء سند قبض مالي (للمدير فقط مع توضيح السبب)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/VoidPaymentDto' } },
          },
        },
        responses: {
          200: {
            description: 'تم إلغاء السند وتحديث القيود المالية',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },

    // ==========================================
    // EXPENSES
    // ==========================================
    '/api/v1/expenses': {
      get: {
        tags: ['Expenses'],
        summary: 'عرض المصروفات مع الفرز بالتاريخ والتصنيف والحالة',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string' } },
          { name: 'endDate', in: 'query', schema: { type: 'string' } },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'قائمة المصروفات',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ExpenseDto' },
                    },
                    metadata: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Expenses'],
        summary: 'تسجيل بند مصروف جديد',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateExpenseDto' } },
          },
        },
        responses: {
          201: {
            description: 'تم تسجيل المصروف بنجاح',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 201 },
                    payload: { $ref: '#/components/schemas/ExpenseDto' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/expenses/{id}/approve': {
      post: {
        tags: ['Expenses'],
        summary: 'اعتماد بند المصروف (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'تم اعتماد المصروف',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/expenses/{id}/reject': {
      post: {
        tags: ['Expenses'],
        summary: 'رفض بند المصروف مع ذكر السبب (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['reason'],
                properties: { reason: { type: 'string', example: 'مبلغ مبالغ فيه دون إيصال' } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'تم رفض المصروف',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/expense-categories': {
      get: {
        tags: ['Expenses'],
        summary: 'عرض تصنيفات المصروفات المتاحة في العيادة',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'قائمة التصنيفات',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ExpenseCategoryDto' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Expenses'],
        summary: 'إضافة تصنيف مصروفات جديد (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: { name: { type: 'string', example: 'صيانة أجهزة طبية' } },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'تمت إضافة التصنيف',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },

    // ==========================================
    // DAILY CLOSING
    // ==========================================
    '/api/v1/closing/preview': {
      get: {
        tags: ['Daily Closing'],
        summary: 'معاينة ملخص إيرادات ومصروفات اليوم وحساب النقدية المتوقعة قبل التقفيل',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string' }, description: 'YYYY-MM-DD' },
        ],
        responses: {
          200: {
            description: 'ملخص المعاينة',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'object',
                      properties: {
                        clinicDate: { type: 'string' },
                        totalPayments: { type: 'number' },
                        cashPayments: { type: 'number' },
                        cardPayments: { type: 'number' },
                        walletPayments: { type: 'number' },
                        totalExpenses: { type: 'number' },
                        expectedCash: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/closing/status': {
      get: {
        tags: ['Daily Closing'],
        summary: 'التحقق مما إذا كان اليوم مقفلاً أم مفتوحاً',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'حالة اليومية',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/closing/history': {
      get: {
        tags: ['Daily Closing'],
        summary: 'سجل التقفيلات المالية السابقة (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'سجل التقفيل اليومي',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/DailyClosingDto' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/closing': {
      post: {
        tags: ['Daily Closing'],
        summary: 'تنفيذ التقفيل المالي اليومي وتثبيت عجز أو زيادة الخزينة',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateDailyClosingDto' } },
          },
        },
        responses: {
          201: {
            description: 'تم تقفيل اليومية بنجاح',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 201 },
                    payload: { $ref: '#/components/schemas/DailyClosingDto' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/closing/{id}/reopen': {
      post: {
        tags: ['Daily Closing'],
        summary: 'إعادة فتح يومية مقفلة (للمدير فقط مع تسجيل السبب في سجل التدقيق)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { notes: { type: 'string', example: 'تصحيح فاتورة بعد المراجعة' } },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'تمت إعادة فتح اليومية بنجاح',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },

    // ==========================================
    // REPORTS
    // ==========================================
    '/api/v1/reports/summary': {
      get: {
        tags: ['Reports'],
        summary: 'تقرير الملخص المالي والتشغيلي العام لفترة زمنية محددة',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string' }, description: 'تاريخ البداية YYYY-MM-DD' },
          { name: 'to', in: 'query', schema: { type: 'string' }, description: 'تاريخ النهاية YYYY-MM-DD' },
        ],
        responses: {
          200: {
            description: 'الملخص الإحصائي',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { $ref: '#/components/schemas/ReportSummaryDto' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/reports/income-by-day': {
      get: {
        tags: ['Reports'],
        summary: 'تحليل الإيرادات يوماً بيوم خلال فترة',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string' } },
          { name: 'to', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'بيانات الدخل اليومية',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/reports/expenses-by-category': {
      get: {
        tags: ['Reports'],
        summary: 'توزيع المصروفات حسب التصنيف',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string' } },
          { name: 'to', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'توزيع المصروفات',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/reports/payments-by-method': {
      get: {
        tags: ['Reports'],
        summary: 'توزيع المدفوعات حسب طريقة الدفع (نقدي، بطاقة، محفظة)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string' } },
          { name: 'to', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: 'طرق الدفع',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },

    // ==========================================
    // SETTINGS
    // ==========================================
    '/api/v1/settings': {
      get: {
        tags: ['Settings'],
        summary: 'عرض إعدادات العيادة الحالية (الأسعار، فترات السماح، وبيانات التواصل)',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'بيانات الإعدادات',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: { $ref: '#/components/schemas/SettingDto' },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Settings'],
        summary: 'تحديث إعدادات العيادة (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SettingDto' } },
          },
        },
        responses: {
          200: {
            description: 'تم حفظ الإعدادات بنجاح',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },

    // ==========================================
    // AUDIT LOGS
    // ==========================================
    '/api/v1/audit-logs': {
      get: {
        tags: ['Audit Logs'],
        summary: 'سجلات المراجعة والتدقيق الأمني لجميع حركات النظام (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'action', in: 'query', schema: { type: 'string' } },
          { name: 'entity', in: 'query', schema: { type: 'string' } },
          { name: 'actorId', in: 'query', schema: { type: 'string' } },
          { name: 'startDate', in: 'query', schema: { type: 'string' } },
          { name: 'endDate', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          200: {
            description: 'سجلات التدقيق',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'boolean', example: true },
                    code: { type: 'integer', example: 200 },
                    payload: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/AuditLogDto' },
                    },
                    metadata: { type: 'object' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ==========================================
    // ATTACHMENTS
    // ==========================================
    '/api/v1/attachments/upload': {
      post: {
        tags: ['Attachments'],
        summary: 'رفع ملف أو صورة فحص طبي مشفرة بصيغة Base64',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AttachmentUploadDto' } },
          },
        },
        responses: {
          201: {
            description: 'تم رفع الملف بنجاح والحصول على رابط العرض',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponseEnvelope' } } },
          },
        },
      },
    },
    '/api/v1/attachments/file/{filename}': {
      get: {
        tags: ['Attachments'],
        summary: 'تحميل وعرض ملف فحص طبي مباشرة عبر المتصفح بالـ MIME المناسب',
        parameters: [{ name: 'filename', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'الملف الثنائي (Binary Stream)',
            content: {
              'application/octet-stream': { schema: { type: 'string', format: 'binary' } },
              'image/jpeg': { schema: { type: 'string', format: 'binary' } },
              'image/png': { schema: { type: 'string', format: 'binary' } },
              'application/pdf': { schema: { type: 'string', format: 'binary' } },
            },
          },
          404: { description: 'الملف غير موجود' },
        },
      },
    },
  },
};

/**
 * دالة لتسجيل وتشغيل Swagger UI في تطبيق Express
 */
export function setupSwagger(app: Express) {
  const swaggerOptions = {
    customSiteTitle: 'د. إسلام عبدالله كريمة | Clinic API Docs',
    customCss: `
      .topbar { display: block; background-color: #0A164E !important; padding: 12px 0; }
      .topbar .link span { display: none; }
      .topbar .link:after { content: '🏥 ENT Clinic - د. إسلام عبدالله كريمة (API Docs)'; color: #F5B800; font-weight: bold; font-size: 17px; margin-left: 12px; }
      .swagger-ui .info .title { color: #0A164E; }
      .swagger-ui .btn.authorize { color: #1D4ED8; border-color: #1D4ED8; }
      .swagger-ui .btn.authorize svg { fill: #1D4ED8; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 2,
    },
  };

  // 1. مسار Swagger UI التفاعلي
  app.use(
    ['/api-docs', '/docs', '/swagger'],
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerOptions)
  );

  // 2. مسار ملف الـ JSON الخام لمواصفات الـ API
  app.get(['/api-docs.json', '/docs.json', '/swagger.json'], (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}
