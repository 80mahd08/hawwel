import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Extend the global object with a custom type for cached Mongoose connection
interface GlobalWithMongoose {
  mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

const globalWithMongoose = globalThis as typeof globalThis & GlobalWithMongoose;

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
  console.log("🧠 Initialized global.mongoose cache");
}

let cached = globalWithMongoose.mongoose;

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    console.log("✅ Using existing Mongoose connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("🔌 Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI as string, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log("🚀 Mongoose connected");
  } catch (error) {
    cached.promise = null;
    console.error("❌ Mongoose connection failed", error);
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
