import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:4000/api/v1';

async function request(path: string, options: RequestInit = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  return { status: res.status, ok: res.ok, data };
}

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    console.error(`❌ [FAIL] ${testName}`, details ?? '');
  }
}

async function runIntegrationTests() {
  console.log('====================================================');
  console.log('🚀 Starting Full Frontend-Backend Integration Test Suite');
  console.log(`📡 Target API: ${BASE_URL}`);
  console.log('====================================================\n');

  // 1. Health check
  const health = await request('http://localhost:4000/');
  assert(health.status === 200 && health.data.status === 'ok', '1. Root health check returns 200 OK');

  // 2. Login as Admin
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: process.env.SEED_ADMIN_USERNAME || 'admin',
      password: process.env.SEED_ADMIN_PASSWORD || 'Adm@150b852037c3026d',
    }),
  });
  assert(
    adminLogin.status === 200 && adminLogin.data.user?.role === 'ADMIN',
    '2. Admin login succeeds with JWT and role ADMIN',
    adminLogin.data,
  );
  const adminToken = adminLogin.data.accessToken;

  // 3. Login as Doctor
  const docLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: process.env.SEED_DOCTOR_USERNAME || 'doctor',
      password: process.env.SEED_DOCTOR_PASSWORD || 'Doc@bf087ab4791a2d9a',
    }),
  });
  assert(
    docLogin.status === 200 && docLogin.data.user?.role === 'DOCTOR',
    '3. Doctor login succeeds with role DOCTOR',
    docLogin.data,
  );
  const docToken = docLogin.data.accessToken;
  const docId = docLogin.data.user.id;

  // 4. Login as Reception
  const recLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: process.env.SEED_RECEPTION_USERNAME || 'reception',
      password: process.env.SEED_RECEPTION_PASSWORD || 'Rec@f3d78b0ea25db701',
    }),
  });
  assert(
    recLogin.status === 200 && recLogin.data.user?.role === 'RECEPTION',
    '4. Reception login succeeds with role RECEPTION',
    recLogin.data,
  );
  const recToken = recLogin.data.accessToken;

  // 5. Token refresh
  const refreshRes = await request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: adminLogin.data.refreshToken }),
  });
  assert(
    refreshRes.status === 200 && !!refreshRes.data.accessToken,
    '5. Refresh token rotation generates fresh access token',
    refreshRes.data,
  );

  // 6. Users / Doctors list
  const docList = await request('/users/doctors', {
    headers: { Authorization: `Bearer ${recToken}` },
  });
  assert(
    docList.status === 200 && Array.isArray(docList.data) && docList.data.some((d: any) => d.id === docId),
    '6. Active doctors list is retrieved successfully',
    docList.data,
  );

  // 7. Settings query
  const settings = await request('/settings', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    settings.status === 200 && typeof settings.data === 'object' && !!settings.data.clinicName,
    '7. Clinic settings retrieved with default configurations',
  );

  // 8. Patient Creation with Reception RBAC restriction
  const testPhone = `010${Math.floor(10000000 + Math.random() * 90000000)}`;
  const patientForbidden = await request('/patients', {
    method: 'POST',
    headers: { Authorization: `Bearer ${recToken}` },
    body: JSON.stringify({
      fullName: 'مريض تجريبي محظور',
      phone: testPhone,
      gender: 'MALE',
      allergies: ['Penicillin'], // Reception cannot set medical fields!
    }),
  });
  assert(
    patientForbidden.status === 403,
    '8. Reception RBAC: Setting medical fields is blocked with 403 Forbidden',
    patientForbidden.data,
  );

  // 9. Valid Patient Creation by Reception
  const patientValid = await request('/patients', {
    method: 'POST',
    headers: { Authorization: `Bearer ${recToken}` },
    body: JSON.stringify({
      fullName: 'أحمد محمود إبراهيم',
      phone: testPhone,
      gender: 'MALE',
    }),
  });
  assert(
    patientValid.status === 201 && !!patientValid.data.id && patientValid.data.allergies === undefined,
    '9. Reception creates patient with basic demographic fields (medical fields omitted)',
    patientValid.data,
  );
  const patientId = patientValid.data.id;

  // 10. Arabic search normalization
  const searchPatients = await request(`/patients?q=احمد`, {
    headers: { Authorization: `Bearer ${recToken}` },
  });
  assert(
    searchPatients.status === 200 && searchPatients.data.data.some((p: any) => p.id === patientId),
    '10. Arabic name search correctly normalizes Alef (أ → ا) and finds patient',
  );

  // 11. Appointment Scheduling (Walk-in)
  const apptRes = await request('/appointments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${recToken}` },
    body: JSON.stringify({
      patientId,
      doctorId: docId,
      source: 'WALK_IN',
      type: 'CONSULTATION',
    }),
  });
  assert(
    apptRes.status === 201 && apptRes.data.status === 'WAITING' && apptRes.data.queueNumber > 0,
    '11. Walk-in appointment scheduled immediately in WAITING queue with queueNumber',
    apptRes.data,
  );
  const apptId = apptRes.data.id;

  // 12. Today queue query
  const queueRes = await request(`/queue/today?doctorId=${docId}`, {
    headers: { Authorization: `Bearer ${docToken}` },
  });
  assert(
    queueRes.status === 200 && Array.isArray(queueRes.data) && queueRes.data.some((q: any) => q.id === apptId),
    '12. Doctor queue returns today waiting appointments with waiting time',
  );

  // 13. Let Patient In (Start Appointment)
  const startRes = await request(`/appointments/${apptId}/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${docToken}` },
  });
  assert(
    startRes.status === 200 && startRes.data.status === 'IN_PROGRESS',
    '13. Appointment transition to IN_PROGRESS succeeds',
    startRes.data,
  );

  // 14. Doctor status updated to WITH_PATIENT
  const docStatus = await request(`/doctor-status?doctorId=${docId}`, {
    headers: { Authorization: `Bearer ${docToken}` },
  });
  assert(
    docStatus.status === 200 && docStatus.data.status === 'WITH_PATIENT',
    '14. Doctor status automatically updated to WITH_PATIENT',
    docStatus.data,
  );

  // 15. Visit created and fetched by Doctor
  const apptDetails = await request(`/appointments/${apptId}`, {
    headers: { Authorization: `Bearer ${docToken}` },
  });
  const visitId = apptDetails.data.visit?.id;
  assert(
    !!visitId && apptDetails.data.visit.status === 'OPEN',
    '15. Visit record was auto-created with status OPEN upon starting appointment',
    apptDetails.data.visit,
  );

  // 16. Autosave Visit Examination
  const autosave = await request(`/visits/${visitId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${docToken}` },
    body: JSON.stringify({
      version: 1,
      complaint: 'صداع وألم مستمر بالعينين',
      diagnosis: 'إجهاد عيني وجفاف بالقرنية',
      notes: 'تقليل استخدام الشاشات',
    }),
  });
  assert(
    autosave.status === 200 && autosave.data.version === 2 && autosave.data.diagnosis.includes('إجهاد'),
    '16. Visit autosaved successfully with optimistic version increment',
    autosave.data,
  );

  // 17. Add Prescription to Visit
  const rxRes = await request(`/visits/${visitId}/prescriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${docToken}` },
    body: JSON.stringify({
      items: [
        {
          drugName: 'Tobrex Eye Drops',
          dose: 'نقطة واحدة',
          frequency: '٣ مرات يومياً',
          duration: '٥ أيام',
        },
      ],
      notes: 'تكرر عند الحاجة',
    }),
  });
  assert(
    rxRes.status === 201 && rxRes.data.items?.length === 1 && rxRes.data.versionNumber === 1,
    '17. Prescription created with medication items and versioning',
    rxRes.data,
  );
  const rxId = rxRes.data.id;

  // 18. Prescription Print Preview with Clinic Meta
  const printRx = await request(`/prescriptions/${rxId}`, {
    headers: { Authorization: `Bearer ${docToken}` },
  });
  assert(
    printRx.status === 200 && !!printRx.data.printMeta?.clinicName,
    '18. Prescription print metadata generated with clinic branding',
    printRx.data.printMeta,
  );

  // 19. Record Cash Payment for Appointment
  const paymentRes = await request(`/appointments/${apptId}/payments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${recToken}` },
    body: JSON.stringify({
      amount: 250,
      method: 'CASH',
      kind: 'CONSULTATION',
    }),
  });
  assert(
    paymentRes.status === 201 && paymentRes.data.amount === 250 && paymentRes.data.method === 'CASH',
    '19. Consultation payment recorded successfully',
    paymentRes.data,
  );

  // 20. Complete Appointment & Close Visit
  const completeRes = await request(`/appointments/${apptId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${docToken}` },
  });
  const visitAfter = await request(`/visits/${visitId}`, {
    headers: { Authorization: `Bearer ${docToken}` },
  });
  const docStatusAfter = await request(`/doctor-status?doctorId=${docId}`, {
    headers: { Authorization: `Bearer ${docToken}` },
  });
  assert(
    completeRes.status === 200 &&
      completeRes.data.status === 'COMPLETED' &&
      visitAfter.data.status === 'CLOSED' &&
      docStatusAfter.data.status === 'AVAILABLE',
    '20. Appointment completion closes visit and sets doctor status to AVAILABLE',
  );

  // 21. Expense Creation & Category
  const categories = await request('/expense-categories', {
    headers: { Authorization: `Bearer ${recToken}` },
  });
  const catId = categories.data[0]?.id;
  const expenseRes = await request('/expenses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${recToken}` },
    body: JSON.stringify({
      categoryId: catId,
      amount: 50,
      description: 'شراء أدوات مكتبية',
      spentAt: new Date().toISOString(),
    }),
  });
  assert(
    expenseRes.status === 201 && expenseRes.data.status === 'PENDING',
    '21. Reception expense created in PENDING status for admin review',
    expenseRes.data,
  );
  const expenseId = expenseRes.data.id;

  // 22. Admin Expense Approval
  const approveRes = await request(`/expenses/${expenseId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    approveRes.status === 200 && approveRes.data.status === 'APPROVED',
    '22. Admin approves expense successfully',
  );

  // 23. Daily Closing Preview
  const previewRes = await request('/closing/preview', {
    headers: { Authorization: `Bearer ${recToken}` },
  });
  assert(
    previewRes.status === 200 &&
      Number(previewRes.data.totalCashPayments) >= 250 &&
      Number(previewRes.data.totalApprovedExpenses) >= 50,
    '23. Daily closing preview calculates expected cash (payments - approved expenses)',
    previewRes.data,
  );

  // 24. Reports Financial Summary
  const today = new Date().toISOString().split('T')[0];
  const summaryRes = await request(`/reports/summary?from=${today}&to=${today}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    summaryRes.status === 200 &&
      Number(summaryRes.data.income) >= 250 &&
      summaryRes.data.visitCount >= 1,
    '24. Financial summary report aggregates income, expenses, and visit count',
    summaryRes.data,
  );

  // 25. Doctor Working Shifts available slots filtering (Sunday: 08:00-12:00 and 16:00-21:00)
  const slotsSun = await request(`/doctor-schedule/${docId}/available-slots?date=2026-10-18`, {
    headers: { Authorization: `Bearer ${docToken}` },
  });
  const sunSlotTimes = slotsSun.data?.slots?.map((s: any) => s.startTime) || [];
  assert(
    slotsSun.status === 200 &&
      slotsSun.data.isWorkingDay === true &&
      sunSlotTimes.includes('08:00') &&
      sunSlotTimes.includes('11:30') &&
      sunSlotTimes.includes('16:00') &&
      sunSlotTimes.includes('20:30') &&
      !sunSlotTimes.includes('12:00') &&
      !sunSlotTimes.includes('13:00') &&
      !sunSlotTimes.includes('15:30'),
    '25. Doctor available slots ONLY include active shift hours and completely exclude unavailable break hours (12:00-16:00)',
    { count: sunSlotTimes.length, sample: sunSlotTimes.slice(0, 5) },
  );

  // 26. Doctor Off-Day available slots filtering (Friday: Off day)
  const slotsFri = await request(`/doctor-schedule/${docId}/available-slots?date=2026-10-23`, {
    headers: { Authorization: `Bearer ${docToken}` },
  });
  assert(
    slotsFri.status === 200 &&
      slotsFri.data.isWorkingDay === false &&
      Array.isArray(slotsFri.data.slots) &&
      slotsFri.data.slots.length === 0,
    '26. Doctor off-day (Friday) returns isWorkingDay: false and 0 slots',
    slotsFri.data,
  );

  console.log('\n====================================================');
  console.log(`🎉 TEST SUMMARY: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    console.log('✨ All frontend-backend contracts and database operations are 100% verified!');
    process.exit(0);
  } else {
    process.exit(1);
  }

}

runIntegrationTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
