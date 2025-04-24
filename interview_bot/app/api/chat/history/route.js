import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

export async function GET(req) {
  try {
    // Get the session ID from the query parameters
    const url = new URL(req.url);
    const session_id = url.searchParams.get('session_id');

    if (!session_id) {
      return Response.json({ error: 'Missing session_id parameter' }, { status: 400 });
    }

    // Get user from auth token
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    let userId;
    try {
      const payload = verifyToken(token);
      console.log('History endpoint token payload:', payload);
      
      // Check for different possible user ID field names in the token
      userId = payload.id || payload.userId || payload.user_id || payload.sub;
      
      if (!userId) {
        console.error('User ID not found in token payload:', payload);
        return Response.json({ error: 'Invalid user identification in token' }, { status: 401 });
      }
    } catch (error) {
      console.error('Token verification error:', error);
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find the chat session
    try {
      const chatSession = await prisma.chatSession.findUnique({
        where: { sessionId: session_id },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      if (!chatSession) {
        return Response.json({ messages: [] });
      }

      // Verify that the session belongs to the authenticated user
      if (chatSession.userId !== userId) {
        console.error(`Unauthorized access: token userId=${userId}, session userId=${chatSession.userId}`);
        return Response.json({ error: 'Unauthorized' }, { status: 403 });
      }

      return Response.json({ 
        sessionId: chatSession.sessionId,
        messages: chatSession.messages
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return Response.json({ error: 'Database error', details: dbError.message }, { status: 500 });
    }
  } catch (err) {
    console.error('Error fetching chat history:', err);
    return Response.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
} 