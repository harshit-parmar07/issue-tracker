import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // In a persistent container environment (like Azure App Service), 
  // connection pools can be managed more efficiently.
  // We still use a singleton to prevent Next.js hot-reload connection exhaustion in dev.
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

globalForPrisma.prisma = prisma;
