import prisma from '../../../../lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return Response.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Load messages from database
    const messages = await prisma.chatMessage.findMany({
      where: {
        sessionId: sessionId
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    // Format messages for frontend
    const formattedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      sender: message.sender,
      timestamp: message.timestamp.toISOString(),
      error: message.error
    }));

    return Response.json({ messages: formattedMessages });
  } catch (error) {
    console.error('Error loading messages:', error);
    return Response.json({ error: 'Failed to load messages' }, { status: 500 });
  }
} 