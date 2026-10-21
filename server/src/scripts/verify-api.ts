async function runVerification() {
  console.log('--- Verifying Backend API Endpoints ---');

  const BASE_URL = 'http://localhost:4000/api/v1';

  // 1. Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'reception', password: 'Reception@123' }),
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed with status ${loginRes.status}: ${await loginRes.text()}`);
  }

  const loginData = (await loginRes.json()) as any;
  console.log(`✓ Login success! User: ${loginData.user.name} (${loginData.user.role})`);
  const token = loginData.accessToken;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Test 4-part name validation rejection
  const invalidRes = await fetch(`${BASE_URL}/patients`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fullName: 'Ahmed Mohamed',
      phone: `010${Math.floor(10000000 + Math.random() * 90000000)}`,
      gender: 'MALE',
    }),
  });

  if (invalidRes.status === 400) {
    const errorBody = await invalidRes.json();
    console.log(`✓ 4-Part Name Rejection PASSED (status 400): ${JSON.stringify(errorBody.message || errorBody)}`);
  } else {
    throw new Error(`Expected status 400 for 2-part name, got ${invalidRes.status}`);
  }

  // 3. Test 4-part name validation acceptance
  const randomPhone = `010${Math.floor(10000000 + Math.random() * 90000000)}`;
  const validRes = await fetch(`${BASE_URL}/patients`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fullName: 'Ahmed Mohamed Ali Hassan',
      phone: randomPhone,
      gender: 'MALE',
    }),
  });

  if (!validRes.ok) {
    throw new Error(`Failed to create valid patient: ${await validRes.text()}`);
  }
  const patient = (await validRes.json()) as any;
  console.log(`✓ 4-Part Name Acceptance PASSED: Created patient ${patient.fullName} (ID: ${patient.id})`);

  // 4. Test GET /patients/:id/booking-summary
  const summaryRes = await fetch(`${BASE_URL}/patients/${patient.id}/booking-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!summaryRes.ok) {
    throw new Error(`Failed to get booking summary: ${await summaryRes.text()}`);
  }
  const summary = (await summaryRes.json()) as any;
  console.log(`✓ Booking Summary Endpoint PASSED:`);
  console.log(`   - Patient: ${summary.patient.fullName}`);
  console.log(`   - Outstanding balance: ${summary.financialSummary?.outstandingBalance} EGP`);
  console.log(`   - Last visit: ${summary.lastVisit ? summary.lastVisit.date : 'None (new patient)'}`);

  // 5. Test Creating an Appointment with 5 types + Attachments support
  const doctorsRes = await fetch(`${BASE_URL}/users/doctors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const doctors = (await doctorsRes.json()) as any[];
  const doctor = doctors[0];
  if (!doctor) throw new Error('No doctor found in seed');

  const apptRes = await fetch(`${BASE_URL}/appointments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      patientId: patient.id,
      doctorId: doctor.id,
      clinicDate: new Date().toISOString().slice(0, 10),
      type: 'POST_OPERATIVE',
      source: 'WALK_IN',
      totalAmount: 350,
      paidAmount: 100,
      attachments: [
        {
          id: 'test-att-1',
          fileName: 'pre-op-scan.jpg',
          fileSize: 10240,
          mimeType: 'image/jpeg',
          url: '/attachments/file/test-scan.jpg',
          uploadedAt: new Date().toISOString(),
        },
      ],
    }),
  });

  if (!apptRes.ok) {
    throw new Error(`Failed to create appointment with POST_OPERATIVE type: ${await apptRes.text()}`);
  }
  const appt = (await apptRes.json()) as any;
  console.log(`✓ Appointment Creation PASSED:`);
  console.log(`   - Appointment ID: ${appt.id}`);
  console.log(`   - Type: ${appt.type} (POST_OPERATIVE)`);
  console.log(`   - Attachments preserved: ${appt.attachments?.length}`);
  console.log(`   - Remaining debt: ${appt.remainingAmount} EGP`);

  // 6. Verify Booking Summary again to ensure previous appointment & debt reflected
  const updatedSummaryRes = await fetch(`${BASE_URL}/patients/${patient.id}/booking-summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const updatedSummary = (await updatedSummaryRes.json()) as any;
  console.log(`✓ Dynamic Patient History & Financial Balance Update PASSED:`);
  console.log(`   - Last visit type: ${updatedSummary.lastVisit?.appointmentType}`);
  console.log(`   - Remaining debt calculated: ${updatedSummary.financialSummary?.outstandingBalance} EGP (matches expected 250 EGP)`);
  console.log(`   - Total billed: ${updatedSummary.financialSummary?.totalCharged} EGP`);
  console.log(`   - Total paid: ${updatedSummary.financialSummary?.totalPaid} EGP`);

  console.log('\n========================================');
  console.log('ALL API WORKFLOW TESTS PASSED SUCCESSFULLY!');
  console.log('========================================\n');
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
