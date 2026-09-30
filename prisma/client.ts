import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  // In serverless environments, we restrict the connection pool to 1
  // to prevent connection exhaustion on the external Aiven database.
  // Make sure your DATABASE_URL includes ?connection_limit=1
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

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
