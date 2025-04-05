import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ascend';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Add global declaration
declare global {
  var mongoose: Cached | undefined;
}

// Initialize global cache
const globalCache = global.mongoose || { conn: null, promise: null };
global.mongoose = globalCache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (globalCache.conn) {
    console.log('Using existing MongoDB connection');
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('Creating new MongoDB connection to:', MONGODB_URI);
    globalCache.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    globalCache.conn = await globalCache.promise;
    console.log('MongoDB connected successfully');
    return globalCache.conn;
  } catch (error) {
    globalCache.promise = null;
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// For backward compatibility with default export
export default connectToDatabase; 