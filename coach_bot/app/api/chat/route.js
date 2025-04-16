import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sessionMemory = {};

export async function POST(req) {
  try {
    const { session_id, message } = await req.json();

    if (!session_id || !message) {
      return Response.json({ error: 'Missing session_id or message' }, { status: 400 });
    }

    if (!sessionMemory[session_id]) {
      sessionMemory[session_id] = [
        {
          role: 'system',
          content: 'You are a professional coaching assistant. Follow ICF guidelines...',
        },
      ];
    }

    sessionMemory[session_id].push({ role: 'user', content: message });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: sessionMemory[session_id],
    });

    const reply = completion.choices[0].message.content;
    sessionMemory[session_id].push({ role: 'assistant', content: reply });

    return Response.json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
