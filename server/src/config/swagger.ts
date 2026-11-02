import { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

/**
 * مواصفات OpenAPI 3.0 لنظام إدارة عيادة د. إسلام عبدالله كريمة
 */
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Clinic Management System API — د. إسلام عبدالله كريمة',
    version: '1.0.0',
    description: `
## واجهة برمجة التطبيقات (API) لنظام إدارة عيادة الأنف والأذن والحنجرة
توفر هذه الواجهة كافة الخدمات لإدارة:
- **المصادقة والمستخدمين (Auth & Users)**: تسجيل الدخول بنظام JWT، الصلاحيات (Admin, Doctor, Reception).
- **المرضى (Patients)**: السجلات الطبية، البحث، الملفات والتاريخ المرضي.
- **المواعيد (Appointments & Scheduling)**: الحجز، دورة حياة الكشف (وصول، بدء، إنهاء، إلغاء).
- **جدول الطبيب وقائمة الانتظار (Doctor Schedule & Queue)**: المواعيد المتاحة وإدارة الصالة.
- **الكشوفات والروشتات (Visits & Prescriptions)**: التشخيص، الأدوية، والأعراض.
- **المالية والمصروفات (Payments & Expenses)**: الفواتير، اليوميات، والتقفيل اليومي (Closing).
- **التقارير والمراجعة (Reports & Audit Logs)**: إحصائيات الدخل والمرضى وسجلات الأمان.
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
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'boolean', example: false },
          code: { type: 'number', example: 400 },
          message: { type: 'string', example: 'بيانات غير صالحة' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: { type: 'string', example: 'field' },
                message: { type: 'string', example: 'رسالة الخطأ' },
              },
            },
          },
        },
      },
      LoginDto: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'Admin@123' },
        },
      },
      UserDto: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65f123456789abcdef012345' },
          username: { type: 'string', example: 'doctor' },
          role: { type: 'string', enum: ['ADMIN', 'DOCTOR', 'RECEPTION'], example: 'DOCTOR' },
          fullName: { type: 'string', example: 'د. إسلام عبدالله كريمة' },
          phone: { type: 'string', example: '+20 10 50792622' },
          isActive: { type: 'boolean', example: true },
        },
      },
      PatientDto: {
        type: 'object',
        required: ['name', 'phone'],
        properties: {
          id: { type: 'string', example: '65f123456789abcdef012346' },
          name: { type: 'string', example: 'أحمد محمود' },
          phone: { type: 'string', example: '01012345678' },
          age: { type: 'number', example: 34 },
          gender: { type: 'string', enum: ['MALE', 'FEMALE'], example: 'MALE' },
          medicalNotes: { type: 'string', example: 'حساسية جيوب أنفية موسمية' },
        },
      },
      AppointmentDto: {
        type: 'object',
        required: ['patientId', 'date', 'type'],
        properties: {
          id: { type: 'string', example: '65f123456789abcdef012347' },
          patientId: { type: 'string', example: '65f123456789abcdef012346' },
          date: { type: 'string', format: 'date-time', example: '2026-11-02T16:00:00Z' },
          type: { type: 'string', enum: ['EXAMINATION', 'CONSULTATION', 'PROCEDURE'], example: 'EXAMINATION' },
          status: {
            type: 'string',
            enum: ['SCHEDULED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
            example: 'SCHEDULED',
          },
          fee: { type: 'number', example: 300 },
          paidAmount: { type: 'number', example: 300 },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'المصادقة، تسجيل الدخول، وتجديد الجلسة' },
    { name: 'Users', description: 'إدارة المستخدمين والأطباء وموظفي الاستقبال' },
    { name: 'Patients', description: 'إدارة ملفات المرضى، السجلات الطبية، والبحث' },
    { name: 'Appointments', description: 'إدارة الحجوزات، المواعيد، ودورة حياة الكشف' },
    { name: 'Doctor Schedule', description: 'أوقات وجداول عمل الطبيب وساعات الحجز' },
    { name: 'Queue', description: 'قائمة الانتظار وصالة الانتظار بالعيادة' },
    { name: 'Visits', description: 'سجلات الزيارات الطبية والتشخيص' },
    { name: 'Prescriptions', description: 'الوصفات والروشتات الطبية' },
    { name: 'Drugs', description: 'دليل الأدوية والجرعات' },
    { name: 'Payments', description: 'المدفوعات، الإيرادات، والمستحقات' },
    { name: 'Expenses', description: 'المصروفات اليومية للعيادة' },
    { name: 'Daily Closing', description: 'التقفيل المالي اليومي وحساب الخزينة' },
    { name: 'Reports', description: 'التقارير والإحصائيات المالية والطبية' },
    { name: 'Settings', description: 'إعدادات العيادة والنظام' },
    { name: 'Audit Logs', description: 'سجلات التدقيق والأمان' },
    { name: 'Attachments', description: 'المرفقات والملفات والتقارير الطبية' },
    { name: 'Health', description: 'فحص صحة الخادم وقاعدة البيانات' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'فحص صحة السيرفر وقاعدة البيانات',
        responses: {
          200: {
            description: 'السيرفر يعمل بكفاءة',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'ok' },
                    service: { type: 'string', example: 'Clinic Management API' },
                    timestamp: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // --- AUTH ---
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'تسجيل الدخول للنظام والحصول على JWT Token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginDto' },
            },
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
                    code: { type: 'number', example: 200 },
                    message: { type: 'string', example: 'Logged in successfully' },
                    payload: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserDto' },
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'تجديد رمز الـ Access Token عبر الـ Refresh Token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'تم التجديد بنجاح' },
          401: { description: 'رمز التجديد غير صالح أو منتهي' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'تسجيل الخروج وإبطال الجلسة',
        responses: {
          200: { description: 'تم تسجيل الخروج بنجاح' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'الحصول على بيانات المستخدم الحالي',
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: 'بيانات المستخدم الحالي',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserDto' },
              },
            },
          },
          401: { description: 'غير مصرح (يجب إرسال Bearer Token)' },
        },
      },
    },

    // --- USERS ---
    '/api/v1/users/doctors': {
      get: {
        tags: ['Users'],
        summary: 'الحصول على قائمة الأطباء المتاحين في العيادة',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'قائمة الأطباء' },
        },
      },
    },
    '/api/v1/users': {
      get: {
        tags: ['Users'],
        summary: 'عرض جميع المستخدمين (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'قائمة المستخدمين' } },
      },
      post: {
        tags: ['Users'],
        summary: 'إنشاء مستخدم جديد (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserDto' },
            },
          },
        },
        responses: { 201: { description: 'تم إنشاء المستخدم' } },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'عرض مستخدم بواسطة المعرف',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'تفاصيل المستخدم' } },
      },
      put: {
        tags: ['Users'],
        summary: 'تحديث بيانات مستخدم',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'تم تحديث المستخدم' } },
      },
      delete: {
        tags: ['Users'],
        summary: 'تعطيل حساب مستخدم',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'تم التعطيل' } },
      },
    },

    // --- PATIENTS ---
    '/api/v1/patients': {
      get: {
        tags: ['Patients'],
        summary: 'البحث وعرض قائمة المرضى',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'query', in: 'query', schema: { type: 'string' }, description: 'بحث بالاسم أو الهاتف' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'قائمة المرضى' } },
      },
      post: {
        tags: ['Patients'],
        summary: 'تسجيل مريض جديد',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PatientDto' },
            },
          },
        },
        responses: { 201: { description: 'تم تسجيل المريض بنجاح' } },
      },
    },
    '/api/v1/patients/{id}': {
      get: {
        tags: ['Patients'],
        summary: 'عرض ملف مريض بالتفصيل',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'بيانات المريض' } },
      },
      put: {
        tags: ['Patients'],
        summary: 'تحديث بيانات مريض',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'تم التحديث بنجاح' } },
      },
    },
    '/api/v1/patients/{id}/history': {
      get: {
        tags: ['Patients'],
        summary: 'السجل الطبي الكامل للمريض',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'سجل الكشوفات والعمليات السابقة' } },
      },
    },
    '/api/v1/patients/{id}/booking-summary': {
      get: {
        tags: ['Patients'],
        summary: 'ملخص الحجوزات والمدفوعات السابقة للمريض',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'ملخص الحجوزات' } },
      },
    },

    // --- APPOINTMENTS ---
    '/api/v1/appointments': {
      get: {
        tags: ['Appointments'],
        summary: 'عرض وتصفية المواعيد',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' }, description: 'YYYY-MM-DD' },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'doctorId', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'قائمة المواعيد' } },
      },
      post: {
        tags: ['Appointments'],
        summary: 'حجز موعد جديد',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AppointmentDto' },
            },
          },
        },
        responses: { 201: { description: 'تم الحجز بنجاح' } },
      },
    },
    '/api/v1/appointments/{id}': {
      get: {
        tags: ['Appointments'],
        summary: 'عرض تفاصيل موعد',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'تفاصيل الموعد' } },
      },
      put: {
        tags: ['Appointments'],
        summary: 'تعديل موعد',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'تم التعديل' } },
      },
    },
    '/api/v1/appointments/{id}/arrive': {
      post: {
        tags: ['Appointments'],
        summary: 'تسجيل وصول المريض إلى العيادة ودخوله طابور الانتظار',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'تم تسجيل الوصول' } },
      },
    },
    '/api/v1/appointments/{id}/start': {
      post: {
        tags: ['Appointments'],
        summary: 'بدء الكشف ودخول المريض للطبيب',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'تم بدء الكشف' } },
      },
    },
    '/api/v1/appointments/{id}/complete': {
      post: {
        tags: ['Appointments'],
        summary: 'إنهاء الكشف وتسجيل الزيارة',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'تم إنهاء الكشف' } },
      },
    },
    '/api/v1/appointments/{id}/cancel': {
      post: {
        tags: ['Appointments'],
        summary: 'إلغاء الموعد',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'تم الإلغاء' } },
      },
    },
    '/api/v1/appointments/{id}/no-show': {
      post: {
        tags: ['Appointments'],
        summary: 'تسجيل عدم حضور المريض',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'تم التسجيل' } },
      },
    },
    '/api/v1/appointments/{id}/pay-remaining': {
      post: {
        tags: ['Appointments'],
        summary: 'دفع المبلغ المتبقي من الكشف',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'تم تحصيل المبلغ المتبقي' } },
      },
    },

    // --- DOCTOR SCHEDULE ---
    '/api/v1/doctor-schedule': {
      get: {
        tags: ['Doctor Schedule'],
        summary: 'عرض جدول ومواعيد عمل الطبيب',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'جدول المواعيد' } },
      },
      put: {
        tags: ['Doctor Schedule'],
        summary: 'تحديث أوقات العمل والأيام المتاحة ومدة الكشف',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'تم التحديث بنجاح' } },
      },
    },

    // --- QUEUE ---
    '/api/v1/queue': {
      get: {
        tags: ['Queue'],
        summary: 'عرض قائمة الانتظار الحالية في صالة العيادة',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'قائمة الانتظار الحالية' } },
      },
    },

    // --- VISITS ---
    '/api/v1/visits': {
      get: {
        tags: ['Visits'],
        summary: 'عرض سجلات الكشوفات والزيارات الطبية',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'سجلات الزيارات' } },
      },
      post: {
        tags: ['Visits'],
        summary: 'تسجيل بيانات كشف / زيارة طبية جديدة',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'تم تسجيل الزيارة' } },
      },
    },

    // --- PRESCRIPTIONS & DRUGS ---
    '/api/v1/prescriptions': {
      get: {
        tags: ['Prescriptions'],
        summary: 'عرض الروشتات الطبية',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'قائمة الروشتات' } },
      },
      post: {
        tags: ['Prescriptions'],
        summary: 'إنشاء وطباعة روشتة طبية',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'تم إنشاء الروشتة' } },
      },
    },
    '/api/v1/drugs': {
      get: {
        tags: ['Drugs'],
        summary: 'البحث في دليل أدوية العيادة',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'قائمة الأدوية' } },
      },
      post: {
        tags: ['Drugs'],
        summary: 'إضافة دواء جديد للدليل',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'تمت الإضافة' } },
      },
    },

    // --- FINANCIALS ---
    '/api/v1/payments': {
      get: {
        tags: ['Payments'],
        summary: 'سجل المدفوعات والإيصالات',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'قائمة المدفوعات' } },
      },
      post: {
        tags: ['Payments'],
        summary: 'تسجيل دفعة نقدية جديدة',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'تم تسجيل الدفعة' } },
      },
    },
    '/api/v1/expenses': {
      get: {
        tags: ['Expenses'],
        summary: 'عرض المصروفات اليومية',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'قائمة المصروفات' } },
      },
      post: {
        tags: ['Expenses'],
        summary: 'تسجيل بند مصروف جديد',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'تم تسجيل المصروف' } },
      },
    },
    '/api/v1/closing': {
      get: {
        tags: ['Daily Closing'],
        summary: 'عرض ملخص التقفيل اليومي للخزينة',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'ملخص التقفيل' } },
      },
      post: {
        tags: ['Daily Closing'],
        summary: 'تنفيذ التقفيل المالي لليوم',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'تم تقفيل اليومية بنجاح' } },
      },
    },

    // --- REPORTS & SETTINGS & AUDIT ---
    '/api/v1/reports': {
      get: {
        tags: ['Reports'],
        summary: 'الحصول على تقارير الأداء والدخل والإحصائيات',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'التقارير الإحصائية' } },
      },
    },
    '/api/v1/settings': {
      get: {
        tags: ['Settings'],
        summary: 'عرض إعدادات العيادة الحالية',
        responses: { 200: { description: 'بيانات الإعدادات' } },
      },
    },
    '/api/v1/audit-logs': {
      get: {
        tags: ['Audit Logs'],
        summary: 'سجلات النشاط والأمان (للمدير فقط)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'سجلات التدقيق' } },
      },
    },
    '/api/v1/attachments': {
      post: {
        tags: ['Attachments'],
        summary: 'رفع ملف أو تقرير فحص طبي',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'تم رفع الملف بنجاح' } },
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
      .topbar { display: block; background-color: #0A164E !important; padding: 10px 0; }
      .topbar .link span { display: none; }
      .topbar .link:after { content: '🏥 ENT Clinic - د. إسلام عبدالله كريمة (API Docs)'; color: #F5B800; font-weight: bold; font-size: 16px; margin-left: 10px; }
      .swagger-ui .info .title { color: #0A164E; }
      .swagger-ui .btn.authorize { color: #1D4ED8; border-color: #1D4ED8; }
      .swagger-ui .btn.authorize svg { fill: #1D4ED8; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'list',
      defaultModelsExpandDepth: 1,
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

