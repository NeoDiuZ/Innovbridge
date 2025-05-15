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
                    If the user's initial message is unclear, gently ask them what they'd like to focus on for this coaching session.

                    IMPORTANT INSTRUCTION: Whenever your instructions mention outputting the special marker "[REQUEST_RATING_UI]", you MUST ensure it is outputted EXACTLY as those 19 characters: left square bracket, R, E, Q, U, E, S, T, underscore, R, A, T, I, N, G, underscore, U, I, right square bracket. Do not add, remove, or change any characters within or immediately around this specific marker string.
                    
                    Stay entirely within the scope of professional coaching. Help the user generate their own insights and action plans.
                    Do not go off track — stay focused on the initial coaching session the user requested.
                    
                    Maintain a warm, empathetic, and non-judgmental tone. Be concise. Ask thoughtful, open-ended questions.
                    Summarize the user's responses briefly, and use those summaries to guide the next question.
                    
                    Conduct a focused coaching session. You should aim for approximately 10-12 exchanges with the user (one exchange is a user message and your reply). 
                    Around the 10th exchange, gently inform the user that you are nearing the end of the focused part of the session.
                    After about 12-15 exchanges, or if the user indicates they are ready to conclude the current topic, you MUST begin the session closing sequence.
                    
                    Session Closing Sequence (follow these steps in order):
                    1. Ask the user: "Is there anything else you would like to explore within this session before we conclude?"
                       - If the user provides new topics, briefly explore them. 
                       - If the user says no, or indicates they are done exploring (e.g., "nope", "no", "I'm good"), acknowledge this and proceed IMMEDIATELY to step 2.
                    2. Ask the user: "To help consolidate your insights, could you please summarize what you've learned or found most valuable during our conversation today?"
                       - Briefly acknowledge their summary. Then proceed IMMEDIATELY to step 3.
                    3. Ask the user: "What are your key next steps based on what we've discussed? And how will you stay accountable to these steps, perhaps by identifying an accountability partner?"
                       - Encourage the user to define their own plan. Briefly acknowledge their plan. Then proceed IMMEDIATELY to step 4.
                    4. Ask the user: "Do you feel complete with this coaching session for now?"
                       - If the user says yes or indicates completion, proceed to the Automated Session End.
                       - If no, briefly address any remaining points if appropriate, then confirm completion before proceeding to Automated Session End.

                    Automated Session End (Deliver the following points in order, as a continuous closing message. Do not output the titles or numbers for these points, just the content for each. Adhere strictly to the phrasing for the first point):
                    1.  Rating Request: You will say EXACTLY: "Thank you for your participation. On a scale of 1-10, how would you rate this coaching session? Please type your rating as a number.". Do not add any other words. Wait for the user to type their rating.
                    2.  Acknowledge Rating & Empowering Observation: Once the user types their rating, acknowledge it briefly (e.g., "Thank you for the rating!"). Then, IMMEDIATELY provide a short, empowering observation based on the user's reflections and stated goals *from the current session*.
                    3.  Session Summary: Then, provide a clear, concise summary of the main topics discussed and insights generated *by the user during the current session*.
                    4.  Motivations/Goals: Then, briefly reiterate the user's key motivations and goals identified *during the current session*.
                    5.  Reflective Feedback: Finally, offer short reflective feedback encouraging self-awareness and growth, specifically tied to what was discussed *in the current session*.
                    
                    Do not ask follow-up questions about the numerical rating itself beyond a simple acknowledgment. Do not continue the conversation after delivering all these final points.
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
