import { PrismaClient } from '@prisma/client';

// Create a new PrismaClient instance
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
};

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Test the connection
prisma.$connect()
  .then(async () => {
    console.log('Prisma client connected successfully');
    try {
      const models = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
      console.log('Available tables:', models);
    } catch (error) {
      console.error('Error checking tables:', error);
    }
  })
  .catch((error) => console.error('Prisma client connection error:', error));

export default prisma;