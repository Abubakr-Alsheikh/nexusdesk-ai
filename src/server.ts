import { env } from './config/env';
import app from './app';
import { prisma } from './services/db.service';

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

async function bootstrap() {
  try {
    // 1. Connect to Database
    await prisma.$connect();
    console.info('✅ Database connection established successfully.');

    // 2. Start the Express Server
    const server = app.listen(env.PORT, () => {
      console.info(`🚀 NexusDesk AI Service running on port ${env.PORT}`);
      console.info(`Environment: ${env.NODE_ENV}`);
    });

    // 3. Graceful Shutdown logic (Standard in Enterprise)
    // If the process receives a signal to stop (like Ctrl+C), close DB connections first
    process.on('SIGTERM', () => {
      console.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        prisma.$disconnect();
        console.info('Process terminated.');
      });
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Execute the bootstrap
bootstrap();
