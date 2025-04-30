import prisma from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const { messages, sessionId } = await req.json();

    if (!messages || !sessionId) {
      return Response.json({ error: 'Missing messages or sessionId' }, { status: 400 });
    }

    // Save each message to the database
    const savedMessages = await Promise.all(
      messages.map(async (message) => {
        return prisma.chatMessage.create({
          data: {
            content: message.content,
            sender: message.sender,
            timestamp: new Date(message.timestamp),
            sessionId: sessionId,
            error: message.error || false
          }
        });
      })
    );

    return Response.json({ success: true, messages: savedMessages });
  } catch (error) {
    console.error('Error saving messages:', error);
    return Response.json({ error: 'Failed to save messages' }, { status: 500 });
  }
} 