import { PrismaClient } from '@prisma/client';
import logger from '@logger';

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'dev'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

prisma
  .$connect()
  .then(() => {
    logger.info('Connected to PostgreSQL database');
  })
  .catch((error: Error) => {
    logger.error(`Failed to connect to database: ${error.message}`);
    process.exit(1);
  });

  process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('🔌 Disconnected from database');
});

export { prisma };