import mongoose from 'mongoose';

let cachedConnection: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!connectionPromise) {
    let mongoUri = process.env.MONGODB_URI;
    if (!mongoUri && process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mongodb')) {
      mongoUri = process.env.DATABASE_URL;
    }

    if (!mongoUri) {
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        throw new Error(
          'Missing MONGODB_URI environment variable on Vercel. Please add MONGODB_URI in your Vercel Project Settings > Environment Variables.'
        );
      }
      mongoUri = 'mongodb://localhost:27017/clinic-management';
    }
    
    connectionPromise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      })
      .then((m) => {
        cachedConnection = m;
        console.log('🍃 MongoDB Connected successfully');
        return m;
      })
      .catch((err) => {
        connectionPromise = null;
        console.error('❌ MongoDB Connection Error:', err);
        throw err;
      });
  }

  return connectionPromise;
}

export default connectDB;
