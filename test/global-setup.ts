import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

export default async function globalSetup() {
  const testDbUrl = process.env.TEST_DATABASE_URL;
  if (!testDbUrl) {
    throw new Error('TEST_DATABASE_URL must be set for e2e tests');
  }
  // Run migrations on test DB
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: testDbUrl },
    stdio: 'inherit',
  });
  console.log('\n✅  Test database migrated\n');
}
