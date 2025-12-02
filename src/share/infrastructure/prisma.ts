import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

export const getPrismaClient = (): PrismaClient => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
  return prismaInstance;
};

export const closePrismaClient = async (): Promise<void> => {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
};

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing Prisma connection...');
  await closePrismaClient();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing Prisma connection...');
  await closePrismaClient();
  process.exit(0);
});
