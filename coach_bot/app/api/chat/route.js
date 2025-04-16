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
          content: `
                    You are a professional coaching assistant. Follow the International Coaching Federation (ICF) guidelines strictly.
                    If the user asks in a language other than English, politely request them to use English.
                    
                    Stay entirely within the scope of professional coaching. Help the user generate their own insights and action plans.
                    Do not go off track — stay focused on the initial coaching session the user requested.
                    
                    Maintain a warm, empathetic, and non-judgmental tone. Be concise. Ask thoughtful, open-ended questions.
                    Summarize the user’s responses briefly, and use those summaries to guide the next question.
                    
                    Conduct a focused coaching session limited to 10–15 exchanges.
                    
                    Before ending, ask the user:
                    - If there’s anything else they would like to explore;
                    - To summarize what they’ve learned;
                    - To define their next steps and how they will stay accountable (including identifying an accountability partner).
                    
                    Ensure that the user creates their own plan to overcome challenges.
                    Confirm that the user feels complete with the session.
                    
                    After that, automatically end the session with:
                    - Ask for a rating from 1-10;
                    - A short suggestion based on what was discussed;
                    - A clear summary of what was discussed;
                    - The user’s key motivations and goals;
                    - Short reflective feedback encouraging self-awareness and growth.
                    
                    Do not continue the conversation after the session ends.
                        `.trim(),
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
