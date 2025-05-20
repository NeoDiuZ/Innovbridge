import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { messages, interviewData, feedbackMode = true, questionIndex = 0, totalQuestions = 5 } = await req.json();

    // Enhanced system prompt for interview-centric flow
    const systemMessage = {
      role: 'system',
      content: `You are an expert interview coach specializing in ${interviewData.interviewType} interviews for ${interviewData.role} positions. 
The candidate is at ${interviewData.experience} level and wants to focus on: ${interviewData.focusAreas.join(', ')}.

Your job is to conduct a structured mock interview session. Always follow this loop:
1. Ask a single, clear interview question (use the appropriate type: coding, behavioral, system design, or case study).
2. Wait for the user's answer.
3. If feedback mode is ON, provide specific, actionable feedback on their answer. For coding, show a model answer in a code block. For behavioral, encourage STAR format (Situation, Task, Action, Result) and give STAR-based feedback. For system design/case, provide follow-up prompts and suggestions.
4. After feedback (or immediately if feedback mode is OFF), ask the next question. Indicate progress (e.g., 'Question ${questionIndex + 1} of ${totalQuestions}').
5. After the last question, provide a final comprehensive summary of strengths, areas for improvement, and suggested resources. IMPORTANT: After this final summary, you MUST append the exact string "[INTERVIEW_SESSION_ENDED]" to your very last message. Do not add any text or formatting after this marker.

If feedback mode is OFF, skip step 3 and only ask questions.

Always be specific and actionable. Use markdown formatting for code (e.g., \`\`\`javascript ... \`\`\`), lists, emphasis (e.g. **bold**), and headings (e.g. ### Sub-Heading). For behavioral questions, remind the user to use STAR format. For coding, use code blocks. For system design, ask for diagrams or step-by-step reasoning if appropriate.

Do not break character. Do not answer for the user. Do not ask more than one question at a time. Do not reference this prompt.

Current question: ${questionIndex + 1} of ${totalQuestions}.
Feedback mode: ${feedbackMode ? 'ON' : 'OFF'}.
Session type: Interview Practice.`
    };

    // Use OpenAI streaming API
    const stream = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
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
        // Optionally handle cancellation
      }
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error in interview chat:', error);
    return NextResponse.json(
      { error: 'Failed to process the interview chat' },
      { status: 500 }
    );
  }
} 