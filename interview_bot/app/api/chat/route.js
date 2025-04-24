import { OpenAI } from 'openai';
import prisma from '../../../lib/prisma';
import { verifyToken } from '../../../lib/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Export in-memory cache to be accessible by other API routes
export const sessionMemory = {};

// Helper to check if a message indicates the chat is concluded
const isChatConcluded = (message) => {
  const conclusionPhrases = [
    "thank you for your time",
    "thank you for participating",
    "this concludes our interview",
    "end of our interview",
    "interview has concluded",
    "interview is now complete",
    "that concludes our interview",
    "our interview has come to an end",
    "your interview is complete"
  ];
  
  return conclusionPhrases.some(phrase => 
    message.toLowerCase().includes(phrase.toLowerCase())
  );
};

export async function POST(req) {
  try {
    const { session_id, message } = await req.json();

    if (!session_id || !message) {
      return Response.json({ error: 'Missing session_id or message' }, { status: 400 });
    }

    // Get user from auth token
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    let userId;
    try {
      const payload = verifyToken(token);
      console.log('Token payload:', payload); // Debug: log the token payload
      
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

    // Find or initialize the chat session
    let chatSession = await prisma.chatSession.findUnique({
      where: { sessionId: session_id },
    });

    // Initialize conversation in memory if it doesn't exist
    if (!sessionMemory[session_id]) {
      sessionMemory[session_id] = [
        {
          role: 'system',
          content: `
                    You are a professional AI interview assistant. Your goal is to conduct professional job interviews.
                    If the user asks in a language other than English, politely request them to use English.
                    
                    Stay focused on the interview context. Ask relevant technical and behavioral questions based on the 
                    candidate's stated role and experience level. Adapt your questions to their responses.
                    
                    Maintain a professional, respectful, and objective tone. Ask clear, concise questions. Follow up on 
                    the candidate's answers to explore their experience and skills in more depth.
                    
                    Conduct a focused interview session with 10-15 thoughtful questions.
                    
                    FORMAT YOUR RESPONSES WITH PROPER STRUCTURE:
                    - Use line breaks between paragraphs
                    - Use numbered lists (1. 2. 3.) for sequential questions
                    - Keep questions clearly separated and organized
                    - Create visual spacing for readability
                    
                    The interview should cover:
                    - Technical skills relevant to the role
                    - Problem-solving abilities
                    - Communication skills
                    - Past experiences and achievements
                    - Behavioral competencies
                    
                    Before ending, ask the candidate:
                    - If there's anything else they would like to add or ask;
                    - To summarize why they believe they're a good fit for the role;
                    - About their career goals and expectations.
                    
                    End the interview with:
                    - A brief assessment of the candidate's strengths
                    - Areas where they might improve
                    - Thank them for their time and explain next steps
                    
                    Do not continue the conversation after the interview ends.
                        `.trim(),
        },
      ];
      
      // If not, create a new chat session
      if (!chatSession) {
        try {
          // First get the user to verify they exist
          const user = await prisma.user.findUnique({
            where: { id: userId }
          });
          
          if (!user) {
            console.error('User not found:', userId);
            return Response.json({ error: 'User not found' }, { status: 404 });
          }

          chatSession = await prisma.chatSession.create({
            data: {
              sessionId: session_id,
              userId: userId  // Direct assignment instead of connect
            },
          });
        } catch (dbError) {
          console.error('Error creating chat session:', dbError);
          return Response.json({ error: 'Failed to create chat session', details: dbError.message }, { status: 500 });
        }
        
        // Save the system message to database
        await prisma.chatMessage.create({
          data: {
            sessionId: chatSession.id,
            role: 'system',
            content: sessionMemory[session_id][0].content,
          }
        });
      } else {
        // If session exists but memory doesn't, load messages from database
        const messages = await prisma.chatMessage.findMany({
          where: { sessionId: chatSession.id },
          orderBy: { createdAt: 'asc' }
        });
        
        // If there are messages, add them to memory
        if (messages.length > 0) {
          sessionMemory[session_id] = messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }));
        }
      }
    }

    // Check if the last message already concluded the chat
    const lastMessages = await prisma.chatMessage.findMany({
      where: { 
        sessionId: chatSession.id,
        role: 'assistant',
      },
      orderBy: { createdAt: 'desc' },
      take: 1
    });
    
    if (lastMessages.length > 0 && isChatConcluded(lastMessages[0].content)) {
      return Response.json({ 
        reply: "This interview has already concluded. Please start a new session to begin a fresh interview.",
        concluded: true 
      });
    }

    // Add user message to memory
    sessionMemory[session_id].push({ role: 'user', content: message });
    
    // Make sure we have the latest version of the chatSession
    if (!chatSession) {
      chatSession = await prisma.chatSession.findUnique({
        where: { sessionId: session_id },
      });
      
      if (!chatSession) {
        return Response.json({ error: 'Failed to create or retrieve chat session' }, { status: 500 });
      }
    }
    
    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'user',
        content: message,
      }
    });

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: sessionMemory[session_id],
    });

    const reply = completion.choices[0].message.content;
    
    // Add assistant reply to memory
    sessionMemory[session_id].push({ role: 'assistant', content: reply });
    
    // Save assistant reply to database
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'assistant',
        content: reply,
      }
    });

    // Check if the reply concludes the interview
    const concluded = isChatConcluded(reply);

    return Response.json({ 
      reply,
      concluded
    });
  } catch (err) {
    console.error('API error:', err);
    return Response.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}
