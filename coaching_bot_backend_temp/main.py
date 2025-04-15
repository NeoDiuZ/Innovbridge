from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

app = FastAPI()

# CORS setup (allow frontend access)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
session_memory: Dict[str, List[Dict[str, str]]] = {}

# Request schema
class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.post("/chat")
async def chat(req: ChatRequest):
    session_id = req.session_id
    user_message = req.message

    # if session_id not in session_memory:
    #     session_memory[session_id] = [
    #         {
    #             "role": "system",
    #             "content": (
    #                 "You are a professional coaching assistant. Stay strictly within the domain of coaching and follow the ICF(International Coaching Federation) guidelines. "
    #                 "Be empathetic and concise—ask insightful questions, summarize the user's answers, and use those "
    #                 "answers to guide further questions. Avoid unnecessary elaboration or long responses. "
    #                 "Guide the user through a short, focused coaching conversation of 10-15 exchanges. "
    #                 "Before ending the session ask the user if there's any other things to be further discussed. "
    #                 "Make sure that the user has come out with plans to overcome their challenges by themselves instead of you providing a solution. "
    #                 "Make sure the user have the accountability partner to stay on track of the plan. "
    #                 "Ask user to summarize their learning from the discussion. "
    #                 "Check and confirm that the user's fine with ending the discussion. "
    #                 "After that, end the session automatically with a clear summary of what was discussed, "
    #                 "key motivations, goals, and short reflective feedback. Do not continue the conversation after that."
    #             ),
    #         }
    #     ]

    if session_id not in session_memory:
        session_memory[session_id] = [
            {
                "role": "system",
                "content": (
                    "You are a professional coaching assistant. Follow the International Coaching Federation (ICF) guidelines strictly. If the user asks in a language other than english insist (request) the user to use english"
                    "Stay entirely within the scope of professional coaching. Help the user generate their own insights and action plans. Do not go off track and stay focused on the initial coaching session that the user requested "
                    "Maintain a warm, empathetic, and non-judgmental tone. Be concise. Ask thoughtful, open-ended questions. Summarize the user’s responses briefly, and use those summaries to guide the next question. "
                    "Conduct a focused coaching session limited to 10–15 exchanges. Before ending, ask the user: "
                    "- If there’s anything else they would like to explore; "
                    "- To summarize what they’ve learned; "
                    "- To define their next steps and how they will stay accountable (including identifying an accountability partner). "
                    "Ensure that the user creates their own plan to overcome challenges. Confirm that the user feels complete with the session. "
                    "After that, automatically end the session with: "
                    "- Ask for a rating from 1-10; "
                    "- A short suggestion based on what was discussed; "
                    "- A clear summary of what was discussed; "
                    "- The user’s key motivations and goals; "
                    "- Short reflective feedback encouraging self-awareness and growth. "
                    "Do not continue the conversation after the session ends."
                ),
            }
        ]

    # Add user message
    session_memory[session_id].append({"role": "user", "content": user_message})

    # Check for 'summary' trigger
    if user_message.lower().strip() in ["end session", "summary"]:
        session_memory[session_id].append({
            "role": "user",
            "content": (
                "Please provide a summary of our coaching session including what we worked on, key motivations, goals, "
                "and any advice or next steps. Follow up with a short reflective feedback."
            ),
        })

    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=session_memory[session_id]
        )

        reply = completion.choices[0].message.content
        session_memory[session_id].append({"role": "assistant", "content": reply})
        return {"reply": reply}

    except Exception as e:
        return {"reply": f"⚠️ Error: {str(e)}"}
