import dotenv from 'dotenv';
dotenv.config();

console.log('🚀 [INIT] Booting Clinic Management API Server...');
console.log('⚙️ [CONFIG] NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('⚙️ [CONFIG] PORT:', process.env.PORT || 4000);
console.log(
  '⚙️ [CONFIG] MONGODB_URI set:',
  Boolean(process.env.MONGODB_URI || process.env.DATABASE_URL)
);

// Catch any unhandled errors and print them immediately to stdout/stderr
process.on('uncaughtException', (err) => {
  console.error('💥 [FATAL] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

import app from './app';
import { connectDB } from './db/connection';

const PORT = Number(process.env.PORT) || 4000;
const HOST = '0.0.0.0';

async function bootstrap() {
  try {
    console.log('⏳ [DB] Connecting to MongoDB...');
    await connectDB();
    console.log('✅ [DB] MongoDB connection established successfully.');

    const server = app.listen(PORT, HOST, () => {
      console.log(`🌐 [SERVER] Clinic Management Server running on http://${HOST}:${PORT}`);
      console.log(`📡 [API] Base URL: http://${HOST}:${PORT}/api/v1`);
      console.log(`❤️  [HEALTH] Health check: http://${HOST}:${PORT}/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('👋 HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ [FATAL] Error during startup:', error);
    process.exit(1);
  }
}

bootstrap();
