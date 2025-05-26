import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to load knowledge base
function loadKnowledgeBase() {
  const knowledgePath = join(process.cwd(), 'data', 'faq-knowledge.txt');
  
  if (existsSync(knowledgePath)) {
    try {
      return readFileSync(knowledgePath, 'utf-8');
    } catch (error) {
      console.error('Error reading knowledge base:', error);
      return null;
    }
  }
  return null;
}

export async function POST(req) {
  try {
    const { messages } = await req.json();

    // Load the knowledge base
    const knowledgeBase = loadKnowledgeBase();
    
    let knowledgeContent = '';
    if (knowledgeBase) {
      knowledgeContent = `\n\nKNOWLEDGE BASE:\n${knowledgeBase}\n\n`;
    } else {
      // Fallback content if no knowledge base is available
      knowledgeContent = `\n\nKNOWLEDGE BASE:\nNo specific knowledge base is currently loaded. I can provide general assistance and information about common topics.\n\n`;
    }

    // Enhanced system prompt for FAQ bot
    const systemMessage = {
      role: 'system',
      content: `You are a helpful FAQ assistant for InnovBridge. Your primary role is to answer questions based on the provided knowledge base content.

${knowledgeContent}

INSTRUCTIONS:
1. Answer questions primarily using the information from the knowledge base above.
2. If the knowledge base contains relevant information, use it to provide accurate and detailed answers.
3. If the knowledge base doesn't contain information about the user's question, politely let them know and provide helpful general guidance when appropriate.
4. Be friendly, helpful, and concise in your responses.
5. If asked about topics not covered in the knowledge base, be honest about the limitations but try to provide useful general information.
6. Always maintain a professional and supportive tone.
7. When providing answers from the knowledge base, you can elaborate and explain concepts to make them clearer.
8. If no knowledge base is loaded, focus on providing general assistance and encouraging users to contact support for specific questions.

Your goal is to be as helpful as possible while staying within the bounds of the provided knowledge base.`
    };

    // Use OpenAI streaming API
    const stream = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [systemMessage, ...messages],
      temperature: 0.3, // Lower temperature for more consistent answers
      max_tokens: 1000,
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const contentChunk = chunk.choices[0]?.delta?.content || "";
          if (contentChunk) {
            controller.enqueue(encoder.encode(contentChunk));
          }
        }
        controller.close();
      },
      cancel() {
        // Handle cancellation if needed
      }
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error in FAQ chat:', error);
    return NextResponse.json(
      { error: 'Failed to process the FAQ chat' },
      { status: 500 }
    );
  }
} 