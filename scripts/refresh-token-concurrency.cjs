require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('node:crypto');

const { RefreshTokenPrismaRepository } = require('../dist/auth/infrastructure/repository/refresh-token-prisma-repository');
const { RefreshToken } = require('../dist/auth/domain/refresh-token');
const { RefreshTokenToken } = require('../dist/auth/domain/refresh-token-token');

const prisma = new PrismaClient();

async function main() {
  let userId;

  try {
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: `concurrency-${randomUUID()}@example.com`,
        name: 'Concurrency Test',
        password: 'temporary-test-password',
      },
    });

    userId = user.id;

    const repository = new RefreshTokenPrismaRepository(prisma);
    const originalTokenValue = randomUUID();

    await repository.create(
      new RefreshToken(
        randomUUID(),
        originalTokenValue,
        userId,
        new Date(Date.now() + 60000)
      )
    );

    const rotations = await Promise.all([
      repository.rotate(
        new RefreshTokenToken(originalTokenValue),
        new RefreshToken(randomUUID(), randomUUID(), userId, new Date(Date.now() + 60000))
      ),
      repository.rotate(
        new RefreshTokenToken(originalTokenValue),
        new RefreshToken(randomUUID(), randomUUID(), userId, new Date(Date.now() + 60000))
      ),
    ]);

    const activeTokens = await prisma.refreshToken.count({
      where: {
        userId,
        isRevoked: false,
      },
    });

    console.log('Resultados de las rotaciones:', rotations);
    console.log('Tokens activos restantes:', activeTokens);

    if (rotations.filter(Boolean).length !== 1 || activeTokens !== 0) {
      throw new Error('La prueba de concurrencia no fue superada');
    }

    console.log('PRUEBA DE CONCURRENCIA SUPERADA');
  } finally {
    if (userId) {
      await prisma.user.delete({
        where: { id: userId },
      });
    }

    await prisma.$disconnect();
  }
}

main().catch(error => {
  console.error('ERROR EN LA PRUEBA:', error);
  process.exitCode = 1;
});
