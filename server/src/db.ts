import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coindcx_demo';

let isConnected = false;

// Robust fallback in-memory/file storage when MongoDB is not running locally
const DATA_DIR = path.join(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const connectDB = async (): Promise<boolean> => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[Database] Connected to MongoDB at ${MONGODB_URI}`);
    return true;
  } catch (error: any) {
    console.warn(`[Database] MongoDB connection failed (${error.message}). Activating local memory/persistence storage engine.`);
    isConnected = false;
    return false;
  }
};

export const isDbConnected = () => isConnected;
