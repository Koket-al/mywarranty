import mongoose from 'mongoose';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { User } from './models/index.js';
import { seedDatabase } from './seed.js';

async function bootstrap() {
  try {
    await connectDB();

    // Clean up any legacy indexes from older project collections
    try {
      await mongoose.connection.db.collection('users').dropIndex('account_id_1');
    } catch (_) {}
    await User.syncIndexes().catch(() => {});

    // Auto-seed initial demo accounts if database is empty
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('[Ewnet API] No users found. Auto-seeding initial demo accounts & catalog...');
      await seedDatabase(true);
      console.log('[Ewnet API] Auto-seed complete. Demo credentials are ready!');
    }

    app.listen(env.PORT, () => {
      console.log(`[Ewnet API] Server running on http://localhost:${env.PORT}`);
      console.log(`[Ewnet API] Health check available at http://localhost:${env.PORT}/health`);
    });
  } catch (err) {
    console.error('[Ewnet API] Failed to start server:', err);
    process.exit(1);
  }
}

bootstrap();

