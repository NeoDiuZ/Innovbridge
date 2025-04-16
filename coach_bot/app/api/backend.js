// For Next.js: place this in pages/api/chat.js
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let sessionMemory = {};

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(200).setHeader("Access-Control-Allow-Origin", "*").end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { session_id, message } = req.body;

  if (!session_id || !message) {
    return res.status(400).json({ message: "Missing session_id or message" });
  }

  // Initialize session if needed
  if (!sessionMemory[session_id]) {
    sessionMemory[session_id] = [
      {
        role: "system",
        content: `You are a professional coaching assistant. Follow the ICF guidelines strictly. Stay focused on coaching, ask insightful questions, and help the user find their own path.`,
      },
    ];
  }

  sessionMemory[session_id].push({ role: "user", content: message });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: sessionMemory[session_id],
    });

    const reply = completion.choices[0].message.content;
    sessionMemory[session_id].push({ role: "assistant", content: reply });

    res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({
      reply: "Sorry, I'm having trouble connecting to the coaching service. Please try again later.",
    });
  }
}
