import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

interface GlobalWithMongoose {
  mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

const globalWithMongoose = globalThis as typeof globalThis & GlobalWithMongoose;

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

const cached = globalWithMongoose.mongoose;
 
async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }
 
  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(MONGODB_URI as string, opts);
  }
 
  try {
    cached.conn = await cached.promise;
  } catch (error: unknown) {
    cached.promise = null;
 
    throw error;
  }
 
  return cached.conn;
}

export default dbConnect;
