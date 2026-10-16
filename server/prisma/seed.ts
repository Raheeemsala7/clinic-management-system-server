import { PrismaClient, Role, AppointmentSource, AppointmentType, AppointmentStatus, VisitStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Credentials from env ────────────────────────────────────────────────────
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';
  const doctorUsername = process.env.SEED_DOCTOR_USERNAME ?? 'doctor';
  const doctorPassword = process.env.SEED_DOCTOR_PASSWORD ?? 'Doctor@12345';
  const receptionUsername = process.env.SEED_RECEPTION_USERNAME ?? 'reception';
  const receptionPassword = process.env.SEED_RECEPTION_PASSWORD ?? 'Recept@12345';

  // ── Users ───────────────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      name: 'Admin User',
      username: adminUsername,
      passwordHash: await argon2.hash(adminPassword),
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const doctor = await prisma.user.upsert({
    where: { username: doctorUsername },
    update: {},
    create: {
      name: 'Dr. Ahmed Hassan',
      username: doctorUsername,
      passwordHash: await argon2.hash(doctorPassword),
      role: Role.DOCTOR,
      isActive: true,
    },
  });

  const reception = await prisma.user.upsert({
    where: { username: receptionUsername },
    update: {},
    create: {
      name: 'Reception Staff',
      username: receptionUsername,
      passwordHash: await argon2.hash(receptionPassword),
      role: Role.RECEPTION,
      isActive: true,
    },
  });

  // ── Doctor Status ────────────────────────────────────────────────────────────
  await prisma.doctorStatus.upsert({
    where: { doctorId: doctor.id },
    update: {},
    create: { doctorId: doctor.id, status: 'AVAILABLE' },
  });

  // ── Expense Categories ────────────────────────────────────────────────────
  const categories = ['supplies', 'rent', 'salaries', 'utilities', 'maintenance', 'other'];
  for (const name of categories) {
    await prisma.expenseCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // ── Settings ─────────────────────────────────────────────────────────────
  const defaultSettings = [
    { key: 'clinicName', value: 'City Clinic' },
    { key: 'doctorDisplayName', value: 'Dr. Ahmed Hassan' },
    { key: 'specialty', value: 'General Practice' },
    { key: 'address', value: '123 Main Street, Cairo, Egypt' },
    { key: 'phone', value: '+20 100 123 4567' },
    { key: 'workingHoursText', value: 'Sat-Thu 9:00 AM - 5:00 PM' },
    { key: 'defaultConsultationFee', value: '200' },
    { key: 'currencyCode', value: process.env.CURRENCY_CODE ?? 'EGP' },
  ];
  for (const s of defaultSettings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  // ── 20 fake patients ─────────────────────────────────────────────────────
  const arabicNames = [
    'محمد علي', 'أحمد حسن', 'فاطمة محمود', 'سارة أحمد', 'عمر خالد',
    'مريم عبدالله', 'يوسف إبراهيم', 'نور الدين', 'خالد مصطفى', 'آية الرحمن',
    'إبراهيم سعد', 'هناء كمال', 'طارق فاروق', 'دينا سامي', 'عادل نصر',
    'رانيا محمد', 'حسام الدين', 'شيماء وليد', 'زياد عمر', 'نهال حسني',
  ];

  const patients = [];
  for (let i = 0; i < 20; i++) {
    const name = arabicNames[i];
    const patient = await prisma.patient.create({
      data: {
        fullName: name,
        searchName: name.toLowerCase()
          .replace(/[أإآٱ]/g, 'ا')
          .replace(/ة/g, 'ه')
          .replace(/ى/g, 'ي')
          .replace(/[\u064B-\u065F\u0640]/g, ''),
        phone: `010${faker.string.numeric(8)}`,
        gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
        dateOfBirth: faker.date.birthdate({ min: 18, max: 75, mode: 'age' }),
        address: `${faker.location.streetAddress()}, Cairo`,
        allergies: i % 3 === 0 ? ['Penicillin'] : [],
        chronicConditions: i % 4 === 0 ? ['Diabetes', 'Hypertension'] : [],
        createdById: reception.id,
      },
    });
    patients.push(patient);
  }

  // ── 5 appointments with visits ─────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i < 5; i++) {
    const patient = patients[i];
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        clinicDate: today,
        source: i < 2 ? AppointmentSource.SCHEDULED : AppointmentSource.WALK_IN,
        type: i % 2 === 0 ? AppointmentType.CONSULTATION : AppointmentType.FOLLOW_UP,
        status: AppointmentStatus.COMPLETED,
        queueNumber: i + 1,
        queueOrder: i + 1,
        arrivedAt: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        createdById: reception.id,
      },
    });

    const visit = await prisma.visit.create({
      data: {
        appointmentId: appointment.id,
        patientId: patient.id,
        doctorId: doctor.id,
        complaint: 'Patient complains of headache and fatigue',
        diagnosis: 'Tension headache',
        notes: 'Patient appears well. BP normal.',
        instructions: 'Rest and hydration. Follow up in 1 week.',
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: VisitStatus.CLOSED,
        closedAt: new Date(),
      },
    });

    // Prescription
    await prisma.prescription.create({
      data: {
        visitId: visit.id,
        patientId: patient.id,
        doctorId: doctor.id,
        versionNumber: 1,
        notes: 'Take medications as directed',
        items: {
          create: [
            { drugName: 'Paracetamol 500mg', dose: '1 tablet', frequency: 'Every 8 hours', duration: '5 days', sortOrder: 0 },
            { drugName: 'Ibuprofen 400mg', dose: '1 tablet', frequency: 'Twice daily', duration: '3 days', sortOrder: 1 },
          ],
        },
      },
    });

    // Payment
    await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        patientId: patient.id,
        amount: 200,
        method: 'CASH',
        kind: i % 2 === 0 ? 'CONSULTATION' : 'FOLLOW_UP',
        receivedById: reception.id,
      },
    });
  }

  // ── Drug catalog seeds ────────────────────────────────────────────────────
  const drugs = [
    { name: 'paracetamol 500mg', usageCount: 50 },
    { name: 'ibuprofen 400mg', usageCount: 35 },
    { name: 'amoxicillin 500mg', usageCount: 28 },
    { name: 'omeprazole 20mg', usageCount: 22 },
    { name: 'metformin 500mg', usageCount: 18 },
    { name: 'amlodipine 5mg', usageCount: 15 },
    { name: 'atorvastatin 20mg', usageCount: 12 },
    { name: 'cetirizine 10mg', usageCount: 10 },
  ];
  for (const drug of drugs) {
    await prisma.drug.upsert({
      where: { name: drug.name },
      update: {},
      create: drug,
    });
  }

  console.log('\n✅ Seeding complete!\n');
  console.log('════════════════════════════════════════');
  console.log('  SEEDED CREDENTIALS (save these now!)  ');
  console.log('════════════════════════════════════════');
  console.log(`  Admin:     ${adminUsername} / ${adminPassword}`);
  console.log(`  Doctor:    ${doctorUsername} / ${doctorPassword}`);
  console.log(`  Reception: ${receptionUsername} / ${receptionPassword}`);
  console.log('════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
