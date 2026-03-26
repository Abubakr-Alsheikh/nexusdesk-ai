import app from './app';
import { env } from './config/env';
import { prisma } from './services/db.service';

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

async function bootstrap() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection established successfully.');

    const server = app.listen(env.PORT, () => {
      console.log(`🚀 NexusDesk AI Service running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });

    process.on('unhandledRejection', (err: any) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
}

bootstrap();