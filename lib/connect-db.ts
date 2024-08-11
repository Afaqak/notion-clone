import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL!;

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

if (!DATABASE_URL) {
  throw new Error(
    "Please define the DATABASE_URL environment variable inside .env.local"
  );
}

// Initialize global.mongoose if it doesn't already exist
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<mongoose.Mongoose> {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      cached.promise = mongoose
        .connect(DATABASE_URL, {
          bufferCommands: false,
          // Adding additional connection options for better reliability
          serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
          socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
          connectTimeoutMS: 30000, // 30 seconds timeout for initial connection
        })
        .then((mongoose) => {
          console.log("Connected to MongoDB");
          return mongoose;
        })
        .catch((error) => {
          // Handle connection error and reset the promise to allow retry
          cached.promise = null;
          console.error("Failed to connect to MongoDB:", error);
          throw new Error(`Failed to connect to MongoDB: ${error.message}`);
        });
    }
    cached.conn = await cached.promise;
  } catch (error: any) {
    // Handle the error if the promise was rejected
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }

  return cached.conn;
}

export default connectDB;
