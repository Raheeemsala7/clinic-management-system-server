import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../db/connection';
import { QueueService } from '../services/queue.service';
import { Appointment } from '../models';
import { getTodayClinicDate } from '../utils/clinic-date';

async function main() {
  await connectDB();
  const today = getTodayClinicDate();
  console.log('--- Checking getTodayClinicDate() ---');
  console.log('Today string is:', today);

  console.log('\n--- Checking Appointments matching today ---');
  const allToday = await Appointment.find({ clinicDate: today });
  console.log(`Found ${allToday.length} appointments with clinicDate = "${today}":`);
  allToday.forEach((a: any) => {
    console.log(`- ID: ${a.id}, status: ${a.status}, doctorId: ${a.doctorId}, source: ${a.source}, clinicDate: ${a.clinicDate}`);
  });

  console.log('\n--- Checking QueueService.getTodayQueue() ---');
  const queue = await QueueService.getTodayQueue();
  console.log('Queue returned items count:', queue.length);
  console.log('Queue data:', JSON.stringify(queue, null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

