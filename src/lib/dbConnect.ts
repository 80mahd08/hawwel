import mongoose, { Mongoose } from "mongoose";
import logger from "../../services/logger";

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
  logger.info("🧠 Initialized global.mongoose cache");
}

let cached = globalWithMongoose.mongoose;

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    logger.debug("✅ Using existing Mongoose connection");
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    logger.info("🔌 Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI as string, opts);
  }

  try {
    cached.conn = await cached.promise;
    logger.info("🚀 Mongoose connected");
  } catch (error: any) {
    cached.promise = null;
    logger.error("❌ Mongoose connection failed", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
