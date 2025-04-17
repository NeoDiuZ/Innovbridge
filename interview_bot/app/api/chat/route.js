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
                    You are a professional AI interview assistant. Your goal is to conduct professional job interviews.
                    If the user asks in a language other than English, politely request them to use English.
                    
                    Stay focused on the interview context. Ask relevant technical and behavioral questions based on the 
                    candidate's stated role and experience level. Adapt your questions to their responses.
                    
                    Maintain a professional, respectful, and objective tone. Ask clear, concise questions. Follow up on 
                    the candidate's answers to explore their experience and skills in more depth.
                    
                    Conduct a focused interview session with 10-15 thoughtful questions.
                    
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
