import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import OpenAI from 'openai';

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

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const { session_id, message } = await request.json();

    if (!session_id || !message) {
      return NextResponse.json(
        { error: 'Session ID and message are required' },
        { status: 400 }
      );
    }

    // Check if this is the first message in the session
    const existingMessages = await prisma.chatMessage.findMany({
      where: { sessionId: session_id },
      orderBy: { createdAt: 'asc' }
    });
2
    // If first message, add the system prompt
    if (existingMessages.length === 0) {
      const systemPrompt = `e
        You are a professional AI interview assistant. Your goal is to conduct professional job interviews.
        If the user asks in a language other than English, politely request them to use English.
        
        Stay focused on the interview context. Ask relevant technical and behavioral questions based on the 
        candidate's stated experience level. Adapt your questions to their responses.
        
        Maintain a professional, respectful, and objective tone. Ask clear, concise questions. Follow up on 
        the candidate's answers to explore their experience and skills in more depth.
        
        Conduct a focused interview session with 10-15 thoughtful questions.
        
        FORMAT YOUR RESPONSES WITH PROPER STRUCTURE:
        - Use line breaks between paragraphs
        - Use numbered lists (1. 2. 3.) for sequential questions
        - Keep questions clearly separated and organized
        - Create visual spacing for readability
        
        The interview should cover:
        - Technical skills
        - Problem-solving abilities
        - Communication skills
        - Past experiences and achievements
        - Behavioral competencies
        
        Before ending, ask the candidate:
        - If there's anything else they would like to add or ask;
        - About their career goals and expectations.
        
        End the interview with:
        - A brief assessment of the candidate's strengths
        - Areas where they might improve
        - Thank them for their time and explain next steps
        
        Do not continue the conversation after the interview ends.
      `.trim();

      try {
        await prisma.chatMessage.create({
          data: {
            content: systemPrompt,
            sender: 'system',
            sessionId: session_id
          }
        });
      } catch (dbError) {
        console.error('Failed to save system message:', dbError);
        throw new Error('Failed to initialize chat session');
      }
    }

    // Check if the last bot message concluded the chat
    const lastBotMessage = await prisma.chatMessage.findFirst({
      where: { 
        sessionId: session_id,
        sender: 'bot'
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (lastBotMessage && isChatConcluded(lastBotMessage.content)) {
      return NextResponse.json({ 
        reply: "This interview has already concluded. Please start a new session to begin a fresh interview.",
        concluded: true 
      });
    }

    // Save user message
    try {
      await prisma.chatMessage.create({
        data: {
          content: message,
          sender: 'user',
          sessionId: session_id
        }
      });
    } catch (dbError) {
      console.error('Failed to save user message:', dbError);
      throw new Error('Failed to save your message');
    }

    // Get chat history for OpenAI
    const chatHistory = await prisma.chatMessage.findMany({
      where: { sessionId: session_id },
      orderBy: { createdAt: 'asc' }
    });

    // Generate AI response
    let completion;
    try {
      // Map messages for OpenAI API
      const messages = chatHistory.map(msg => {
        let type = 'user';
        if (msg.sender === 'bot') type = 'assistant';
        if (msg.sender === 'system') type = 'system';
        
        return {
          content: msg.content,
          role: type
        };
      });

      completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages
      });
    } catch (aiError) {
      console.error('OpenAI API error:', aiError);
      throw new Error('Failed to generate AI response');
    }

    const reply = completion.choices[0].message.content;
    
    // Save bot response
    try {
      await prisma.chatMessage.create({
        data: {
          content: reply,
          sender: 'bot',
          sessionId: session_id
        }
      });
    } catch (dbError) {
      console.error('Failed to save bot response:', dbError);
      throw new Error('Failed to save the response');
    }

    return NextResponse.json({ 
      reply,
      concluded: isChatConcluded(reply)
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process message',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
