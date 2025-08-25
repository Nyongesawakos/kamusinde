// src/lib/database.ts (or src/lib/mongoose.ts)

import mongoose from "mongoose";
import { MongoClient } from "mongodb"; // Import MongoClient type

// Connection state and promise caching
let isConnected: boolean = false;
let clientPromise: Promise<MongoClient> | null = null;

// --- Environment Variable Check ---
// Ensure this check runs reliably. Put it outside functions if needed on module load.
const MONGODB_URI = process.env.MONGODB_URL;
const DB_NAME = process.env.MONGODB_DB_NAME || "kbhsschool"; // Use env var or default

if (!MONGODB_URI) {
  console.error(
    "FATAL ERROR: Missing MONGODB_URL environment variable. Check your .env.local file."
  );
  // Optionally throw an error to prevent startup without the URL
  // throw new Error("Missing MONGODB_URL environment variable.");
}
// --- End Environment Variable Check ---

export const connectToDatabase = async () => {
  // console.log("[DB] connectToDatabase called."); // Can be noisy

  // Avoid multiple connection attempts concurrently
  if (mongoose.connection.readyState >= 1 && clientPromise) {
    // console.log("[DB] Already connecting or connected."); // Can be noisy
    // Ensure the existing promise is returned
    return { db: mongoose.connection, clientPromise };
  }

  // Prevent Mongoose deprecation warning
  mongoose.set("strictQuery", true);

  if (!MONGODB_URI) {
    console.error("[DB] Cannot connect: MONGODB_URL is not defined.");
    throw new Error("MONGODB_URL is not defined.");
  }

  console.log("[DB] Attempting new MongoDB connection...");
  try {
    // Establish the Mongoose connection
    // Mongoose.connect itself returns a promise resolving to the Mongoose instance,
    // but we work with the default connection mongoose.connection afterwards.
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      bufferCommands: false, // Disable buffering
      // Add other recommended options if necessary:
      // serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      // socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    isConnected = true; // Update state *after* successful connection

    // ** THE CORRECTED FIX **: Use the getClient() method on the connection
    const mongoClient = mongoose.connection.getClient();

    // Cache the promise resolving to the MongoClient
    // Note: getClient() returns the client directly, so wrap it in Promise.resolve
    // if we are re-assigning the promise. If getClientPromise ensures connection first,
    // we can be sure it exists.
    clientPromise = Promise.resolve(mongoClient);

    console.log(`[DB] MongoDB connected successfully to database: ${DB_NAME}`);

    // Return the Mongoose connection object and the client promise
    return { db: mongoose.connection, clientPromise };
  } catch (error) {
    console.error("[DB] MongoDB connection failed:", error);
    isConnected = false;
    clientPromise = null; // Reset promise on failure
    // Re-throw the error so the calling function knows connection failed
    throw error;
  }
};

/**
 * Retrieves the promise that resolves to the MongoClient instance.
 * Required by the @auth/mongodb-adapter.
 * Ensures the database is connected before returning the promise.
 */
export const getClientPromise = async (): Promise<MongoClient> => {
  console.log("[DB] getClientPromise called.");

  // If the connection is already established and promise cached, return it
  // Check readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1 && clientPromise) {
    console.log("[DB] Connection exists, returning cached client promise.");
    return clientPromise;
  }

  // If not connected or promise not cached, ensure connection first
  console.log("[DB] No active connection/promise, ensuring connection...");
  try {
    // connectToDatabase will establish connection and set clientPromise
    const { clientPromise: establishedPromise } = await connectToDatabase();

    // Check if the promise was successfully set
    if (!establishedPromise) {
      console.error(
        "[DB] FATAL: connectToDatabase finished but clientPromise is still null!"
      );
      throw new Error("Database connection inconsistency after connect.");
    }

    console.log(
      "[DB] Connection established by getClientPromise, returning promise."
    );
    return establishedPromise; // Return the promise obtained from connectToDatabase
  } catch (error) {
    console.error(
      "[DB] Error during getClientPromise (connection failed):",
      error
    );
    // Re-throw the error to propagate it to the adapter/caller
    throw error;
  }
};

export const closeDatabaseConnection = async (): Promise<void> => {
  if (!isConnected && mongoose.connection.readyState === 0) {
    console.log("[DB] Close requested, but already disconnected.");
    return;
  }

  console.log("[DB] Attempting to close MongoDB connection...");
  try {
    await mongoose.connection.close();
    isConnected = false;
    clientPromise = null; // Clear cache on close
    console.log("[DB] MongoDB connection closed successfully.");
  } catch (error) {
    console.error("[DB] Error closing MongoDB connection:", error);
    // Decide whether to throw or just log
    // throw error;
  }
};

// Graceful shutdown listeners
process.on("SIGINT", async () => {
  console.log("[DB] SIGINT received, closing MongoDB connection...");
  await closeDatabaseConnection();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  console.log("[DB] SIGTERM received, closing MongoDB connection...");
  await closeDatabaseConnection();
  process.exit(0);
});
