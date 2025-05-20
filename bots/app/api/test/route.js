import { PrismaClient } from '@prisma/client';

export async function GET() {
  try {
    console.log('Testing Prisma client...');
    
    // Create a new PrismaClient instance for testing
    const testPrisma = new PrismaClient();
    console.log('Created new PrismaClient instance');
    
    try {
      await testPrisma.$connect();
      console.log('Connected to database successfully');
      
      // Check available tables
      const tables = await testPrisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
      console.log('Available tables:', tables);
      
      // Test if ChatMessage table exists
      const chatMessageExists = tables.some(table => table.table_name === 'ChatMessage');
      console.log('ChatMessage table exists:', chatMessageExists);
      
      if (!chatMessageExists) {
        throw new Error('ChatMessage table does not exist in the database');
      }
      
      // Test the connection by trying to count messages
      const count = await testPrisma.$queryRaw`SELECT COUNT(*) FROM "ChatMessage"`;
      console.log('Successfully counted messages:', count);
      
      return Response.json({ 
        success: true, 
        message: 'Prisma client is working',
        count: count[0].count,
        tables: tables.map(t => t.table_name)
      });
    } finally {
      await testPrisma.$disconnect();
    }
  } catch (error) {
    console.error('Prisma test error:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      success: false, 
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 