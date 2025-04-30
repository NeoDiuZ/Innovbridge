import prisma from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const { messages, sessionId } = await req.json();
    console.log('Received request to save messages:', { messages, sessionId });

    if (!messages || !sessionId) {
      console.error('Missing messages or sessionId');
      return Response.json({ error: 'Missing messages or sessionId' }, { status: 400 });
    }

    if (!prisma || !prisma.chatMessage) {
      console.error('Prisma client or ChatMessage model not initialized');
      return Response.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Save each message to the database
    const savedMessages = await Promise.all(
      messages.map(async (message) => {
        console.log('Saving message:', message);
        try {
          const savedMessage = await prisma.chatMessage.create({
            data: {
              content: message.content,
              sender: message.sender,
              timestamp: new Date(message.timestamp),
              sessionId: sessionId,
              error: message.error || false
            }
          });
          console.log('Saved message:', savedMessage);
          return savedMessage;
        } catch (error) {
          console.error('Error saving individual message:', error);
          throw error;
        }
      })
    );

    console.log('All messages saved successfully:', savedMessages);
    return Response.json({ success: true, messages: savedMessages });
  } catch (error) {
    console.error('Error saving messages:', error);
    return Response.json({ error: 'Failed to save messages' }, { status: 500 });
  }
} 