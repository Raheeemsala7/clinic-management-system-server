import dotenv from 'dotenv';
dotenv.config();

import argon2 from 'argon2';
import { connectDB } from '../db/connection';
import { User, Setting, ExpenseCategory, Drug, DoctorStatus } from '../models';

async function seed() {
  console.log('--- Starting MongoDB Database Seed ---');
  await connectDB();

  // 1. Seed Users
  const usersToSeed = [
    {
      username: (process.env.SEED_ADMIN_USERNAME || 'admin').toLowerCase().trim(),
      password: process.env.SEED_ADMIN_PASSWORD || 'Adm@150b852037c3026d',
      name: 'System Administrator',
      role: 'ADMIN',
    },
    {
      username: (process.env.SEED_DOCTOR_USERNAME || 'doctor').toLowerCase().trim(),
      password: process.env.SEED_DOCTOR_PASSWORD || 'Doc@bf087ab4791a2d9a',
      name: 'Dr. Ahmed Mostafa',
      role: 'DOCTOR',
    },
    {
      username: (process.env.SEED_RECEPTION_USERNAME || 'reception').toLowerCase().trim(),
      password: process.env.SEED_RECEPTION_PASSWORD || 'Rec@f3d78b0ea25db701',
      name: 'Reception Staff',
      role: 'RECEPTION',
    },
  ];

  for (const u of usersToSeed) {
    const existing = await User.findOne({ username: u.username });
    const passwordHash = await argon2.hash(u.password);

    if (!existing) {
      const user = await User.create({
        name: u.name,
        username: u.username,
        passwordHash,
        role: u.role,
        isActive: true,
      });
      console.log(`Created user: ${u.username} (${u.role}) [ID: ${user.id}]`);

      if (u.role === 'DOCTOR') {
        await DoctorStatus.findByIdAndUpdate(
          user.id,
          { _id: user.id, status: 'AVAILABLE' },
          { upsert: true },
        );
      }
    } else {
      existing.passwordHash = passwordHash;
      existing.isActive = true;
      existing.name = u.name;
      existing.role = u.role as any;
      await existing.save();
      console.log(`Updated existing user: ${u.username} (${u.role}) [ID: ${existing.id}]`);

      if (u.role === 'DOCTOR') {
        await DoctorStatus.findByIdAndUpdate(
          existing.id,
          { _id: existing.id, status: 'AVAILABLE' },
          { upsert: true },
        );
      }
    }
  }

  // 2. Seed Settings
  const settingsToSeed: Record<string, string> = {
    clinicName: 'عيادة النور التخصصية',
    doctorDisplayName: 'د. أحمد مصطفى',
    specialty: 'العيادات التخصصية',
    address: 'القاهرة - مصر',
    phone: '01000000000',
    workingHoursText: 'السبت - الخميس: ٩ صباحاً - ٩ مساءً',
    defaultConsultationFee: '250',
    currencyCode: 'EGP',
  };

  for (const [key, value] of Object.entries(settingsToSeed)) {
    await Setting.findByIdAndUpdate(
      key,
      { _id: key, value },
      { upsert: true },
    );
  }
  console.log('Seeded default clinic settings.');

  // 3. Seed Expense Categories
  const categories = [
    'مستلزمات طبية وأدوية',
    'أدوات مكتبية ومطبوعات',
    'صيانة ونظافة',
    'كهرباء ومياه وإنترنت',
    'مصروفات نثرية وضيافة',
  ];

  for (const catName of categories) {
    await ExpenseCategory.findOneAndUpdate(
      { name: catName },
      { name: catName, isActive: true },
      { upsert: true },
    );
  }
  console.log(`Seeded ${categories.length} expense categories.`);

  // 4. Seed Popular Drugs
  const drugs = [
    'Panadol Extra 500mg',
    'Augmentin 1g',
    'Cataflam 50mg',
    'Brufen 400mg',
    'Amoxil 500mg',
    'Antinal 200mg',
    'Flagyl 500mg',
    'Voltaren 75mg',
    'Congestal',
    'Tobrex Eye Drops',
  ];

  for (const drugName of drugs) {
    await Drug.findOneAndUpdate(
      { name: drugName.toLowerCase().trim() },
      { name: drugName.toLowerCase().trim(), isActive: true, $setOnInsert: { usageCount: 5 } },
      { upsert: true },
    );
  }
  console.log(`Seeded ${drugs.length} catalog drugs.`);

  console.log('--- MongoDB Seed Completed Successfully! ---');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
