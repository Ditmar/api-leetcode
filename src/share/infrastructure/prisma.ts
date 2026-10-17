import type { PrismaClient } from '@prisma/client';
import { prisma } from './prisma-client';

export const getPrismaClient = (): PrismaClient => {
  return prisma;
};

export const closePrismaClient = async (): Promise<void> => {
  await prisma.$disconnect();
};
