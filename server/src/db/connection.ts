import mongoose from 'mongoose';

let cachedConnection: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  if (!connectionPromise) {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/clinic-management';
    
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
