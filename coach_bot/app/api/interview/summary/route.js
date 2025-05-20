import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { messages, interviewData } = await req.json();
    const conversation = messages.map(m => `${m.sender === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n');
    const prompt = `Summarize the following mock interview session for a ${interviewData.role} (${interviewData.interviewType}) at ${interviewData.experience} level. Highlight strengths, areas for improvement, and actionable next steps. Use markdown formatting.\n\nSession:\n${conversation}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are an expert interview coach.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.6,
    });
    return NextResponse.json({ summary: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate summary.' }, { status: 500 });
  }
} 