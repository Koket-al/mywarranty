import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

// Ensure reliable DNS resolution for MongoDB Atlas SRV records (prevents querySrv timeouts on ISP DNS)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (dnsErr) {
  // fallback to system default DNS if setServers is restricted
}

let isConnected = false;
let memServer = null;

export async function connectDB() {
  if (isConnected) return;

  const mongoOptions = {
    serverSelectionTimeoutMS: 8000
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
  console.log('[Database] Disconnected from MongoDB cleanly.');
}

