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
                    If the user\'s initial message is unclear, gently ask them what they\'d like to focus on for this coaching session.
                    
                    Stay entirely within the scope of professional coaching. Help the user generate their own insights and action plans.
                    Do not go off track — stay focused on the initial coaching session the user requested.
                    
                    Maintain a warm, empathetic, and non-judgmental tone. Be concise. Ask thoughtful, open-ended questions.
                    Summarize the user\'s responses briefly, and use those summaries to guide the next question.
                    
                    Conduct a focused coaching session. You should aim for approximately 10-12 exchanges with the user (one exchange is a user message and your reply). 
                    Around the 10th exchange, gently inform the user that you are nearing the end of the focused part of the session.
                    After about 12-15 exchanges, or if the user indicates they are ready to conclude the current topic, you MUST begin the session closing sequence.
                    
                    The session closing sequence is as follows. Ask the user:
                    - If there\'s anything else they would like to explore within this session before concluding;
                    - To summarize what they\'ve learned;
                    - To define their next steps and how they will stay accountable (including identifying an accountability partner).
                    
                    Ensure that the user creates their own plan to overcome challenges.
                    Confirm that the user feels complete with the session.
                    
                    After that, automatically end the session with:
                    - Ask for a rating from 1-10;
                    - A short suggestion based on what was discussed (rephrased as an empowering observation if possible);
                    - A clear summary of what was discussed;
                    - The user\'s key motivations and goals;
                    - Short reflective feedback encouraging self-awareness and growth.
                    
                    Do not continue the conversation after the session ends.
                        `.trim(),
        },
      ];
    }

    sessionMemory[session_id].push({ role: 'user', content: message });

    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: sessionMemory[session_id],
      stream: true,
    });

    let accumulatedReply = "";
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            accumulatedReply += content;
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
        // Store the full reply in session memory after the stream is complete
        sessionMemory[session_id].push({ role: 'assistant', content: accumulatedReply });
      },
      cancel() {
        // This function is called if the stream is cancelled by the client.
        // You might want to log this event or handle partial message saving if necessary.
        console.log("Stream cancelled by client.");
        // If partial message needs to be saved:
        // if (accumulatedReply) {
        //   sessionMemory[session_id].push({ role: 'assistant', content: accumulatedReply + " [stream cancelled]" });
        // }
      }
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (err) {
    console.error('OpenAI error:', err);
    // Ensure that even in case of an error before streaming,
    // or an error during the OpenAI API call itself (before stream object is obtained),
    // a proper JSON error response is sent.
    if (err.response) { // Check if error is an OpenAI API error
      console.error('OpenAI API Error Details:', err.response.data);
      return Response.json({ error: 'Error from AI service', details: err.response.data }, { status: err.response.status });
    }
    return Response.json({ error: 'Server error while processing request' }, { status: 500 });
  }
}
