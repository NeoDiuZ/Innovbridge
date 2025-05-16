import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sessionMemory = {};

// Helper function to format questionnaire answers for the prompt
function formatQuestionnaireAnswers(answers) {
  if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
    return "No questionnaire data provided.";
  }
  let formatted = "\nUser's Questionnaire Responses:\n";
  for (const [key, value] of Object.entries(answers)) {
    const question = key.replace(/_/g, ' '); // Simple formatting for the key
    formatted += `- ${question.charAt(0).toUpperCase() + question.slice(1)}: ${value}\n`;
  }
  return formatted.trim();
}

export async function POST(req) {
  try {
    const { session_id, message, questionnaire_answers } = await req.json();

    if (!session_id || !message) {
      return Response.json({ error: 'Missing session_id or message' }, { status: 400 });
    }

    if (!sessionMemory[session_id]) {
      let initialSystemPrompt = `
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

        Automated Session End (Deliver the following as a continuous closing message from your side. Do not output the titles or numbers for these points, just the content for each. Adhere strictly to the phrasing for the first point):
        1.  Rating Request: You will say EXACTLY: "Thank you for your participation. On a scale of 1-10, how would you rate this coaching session? Please type your rating as a number.". Do not add any other words. You will then PAUSE and wait for the user to type their numerical rating.
        2.  Concluding Monologue: Once the user has typed their numerical rating, your response MUST begin by acknowledging their rating (e.g., "Thank you for your rating of [user's typed number]!") AND THEN, as part of that SAME continuous and uninterrupted response, you MUST deliver the *content* for ALL the following points (b, c, d, and e) as a flowing, natural-sounding monologue. Do NOT output the labels "Empowering Observation:", "Session Summary:", "Motivations/Goals:", or "Reflective Feedback & End Marker:" or use any markdown formatting for titles. Simply provide the requested information in sequence. Do NOT pause or ask any new questions after acknowledging the rating; the acknowledgment is the START of your single concluding monologue.
            a.  Acknowledge Rating: (This is the start of your monologue as described above)
            b.  Empowering Observation: (Content for this point) IMMEDIATELY follow with a short, empowering observation based on the user's reflections and stated goals *from the current session*.
            c.  Session Summary: (Content for this point) Then, provide a clear, concise summary of the main topics discussed and insights generated *by the user during the current session*. This summary should be a short, flowing paragraph or two, highlighting the key takeaways rather than a list.
            d.  Motivations/Goals: (Content for this point) Then, briefly reiterate the user's key motivations and goals identified *during the current session*.
            e.  Reflective Feedback & End Marker: (Content for this point) Finally, offer short reflective feedback encouraging self-awareness and growth, specifically tied to what was discussed *in the current session*. After this feedback, you MUST append the exact string "[SESSION_ENDED_MARKER]". This is your absolute final output for the session. Do not add any further text or questions after this marker.

        After delivering all parts of your Concluding Monologue (starting with the rating acknowledgment and ending with the marker), your turn is over, and you will not speak further.
      `.trim();

      // If questionnaire answers are provided with the first message, prepend them to the system prompt.
      if (questionnaire_answers) {
        const formattedAnswers = formatQuestionnaireAnswers(questionnaire_answers);
        initialSystemPrompt = formattedAnswers + "\n\nAdditionally, please follow these general coaching guidelines:\n" + initialSystemPrompt;
      }

      sessionMemory[session_id] = [
        {
          role: 'system',
          content: initialSystemPrompt,
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
          const contentChunk = chunk.choices[0]?.delta?.content || "";
          if (contentChunk) {
            accumulatedReply += contentChunk;
            controller.enqueue(encoder.encode(contentChunk));
          }
        }
        controller.close();
        sessionMemory[session_id].push({ role: 'assistant', content: accumulatedReply });
      },
      cancel() {
        console.log("Stream cancelled by client.");
        if (accumulatedReply) {
           sessionMemory[session_id].push({ role: 'assistant', content: accumulatedReply + " [stream cancelled by client]" });
        }
      }
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (err) {
    console.error('OpenAI error or other server error:', err);
    if (err.response) { 
      console.error('OpenAI API Error Details:', err.response.data);
      return Response.json({ error: 'Error from AI service', details: err.response.data }, { status: err.response.status });
    }
    return Response.json({ error: 'Server error while processing request' }, { status: 500 });
  }
}
