import prisma from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/auth';

export async function GET(req) {
  try {
    // Get user from auth token
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    let userId;
    try {
      const payload = verifyToken(token);
      
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

    // Get all sessions for the user
    try {
      const sessions = await prisma.chatSession.findMany({
        where: { 
          userId: userId 
        },
        orderBy: {
          updatedAt: 'desc'
        },
        select: {
          id: true,
          sessionId: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              messages: true
            }
          }
        }
      });

      return Response.json({ sessions });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return Response.json({ error: 'Database error', details: dbError.message }, { status: 500 });
    }
  } catch (err) {
    console.error('Error fetching sessions:', err);
    return Response.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
} 