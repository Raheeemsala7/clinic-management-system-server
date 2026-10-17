import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './db/connection';

const PORT = Number(process.env.PORT) || 4000;

async function bootstrap() {
  try {
    await connectDB();
    console.log('MongoDB connection established successfully.');

    const server = app.listen(PORT, () => {
      console.log(`Clinic Management Express Server running on http://localhost:${PORT}`);
      console.log(`API Base URL: http://localhost:${PORT}/api/v1`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Fatal error during startup:', error);
    process.exit(1);
  }
}

bootstrap();
