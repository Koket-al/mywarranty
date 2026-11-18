import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;
let memServer = null;

export async function connectDB() {
  if (isConnected) return;

  const mongoOptions = {
    serverSelectionTimeoutMS: 3000
  };

  try {
    await mongoose.connect(env.MONGODB_URI, mongoOptions);
    isConnected = true;
    console.log(`[Database] Connected successfully to MongoDB at ${env.MONGODB_URI.split('@').pop()}`);
  } catch (err) {
    console.warn(`[Database] Direct connection to ${env.MONGODB_URI} failed: ${err.message}`);
    console.log('[Database] Starting local in-memory MongoDB runner for zero-dependency development & testing...');
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memServer = await MongoMemoryServer.create();
      const memUri = memServer.getUri();
      await mongoose.connect(memUri);
      isConnected = true;
      console.log(`[Database] In-memory MongoDB operational at ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Fatal: Unable to initialize in-memory MongoDB:', memErr);
      throw memErr;
    }
  }
}

export async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  if (memServer) {
    await memServer.stop();
  }
  isConnected = false;
}

