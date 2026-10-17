import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic-management',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-for-dev',
    accessTtl: Number(process.env.JWT_ACCESS_TTL) || 900, // 15 mins
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-for-dev',
    refreshTtl: Number(process.env.JWT_REFRESH_TTL) || 604800, // 7 days
  },
  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
      : ['http://localhost:3000'],
  },
  clinic: {
    timezone: process.env.CLINIC_TIMEZONE || 'Africa/Cairo',
    currency: process.env.CURRENCY_CODE || 'EGP',
  },
  storage: {
    localPath: process.env.LOCAL_STORAGE_PATH || './uploads',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFilesPerVisit: 10,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  },
  seed: {
    adminUsername: (process.env.SEED_ADMIN_USERNAME || 'admin').toLowerCase().trim(),
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Adm@150b852037c3026d',
    doctorUsername: (process.env.SEED_DOCTOR_USERNAME || 'doctor').toLowerCase().trim(),
    doctorPassword: process.env.SEED_DOCTOR_PASSWORD || 'Doc@bf087ab4791a2d9a',
    receptionUsername: (process.env.SEED_RECEPTION_USERNAME || 'reception').toLowerCase().trim(),
    receptionPassword: process.env.SEED_RECEPTION_PASSWORD || 'Rec@f3d78b0ea25db701',
  },
};
