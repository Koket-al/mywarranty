import { app } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

async function bootstrap() {
  try {
    await connectDB();

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

