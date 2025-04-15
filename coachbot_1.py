import openai
import os

# Set your OpenAI API key
openai.api_key = "your-api-key-here"  # Replace with your actual key

# Coaching system prompt
system_prompt = (
    "You are a professional, empathetic life coach. "
    "Your job is to guide users through self-reflection and growth. "
    "You ask thoughtful, open-ended follow-up questions based on their answers. "
    "Help them clarify their goals, uncover motivations, and overcome blockers. "
    "Only ask one question at a time. Never rush. Be gentle and supportive."
)

# Initialize chat history with the system role
chat_history = [
    {"role": "system", "content": system_prompt}
]

# Optionally: Start with an initial question
initial_question = "Hi, I'm here to help you grow. What would you like to work on today?"
chat_history.append({"role": "assistant", "content": initial_question})
print(f"Coach Bot: {initial_question}")

# Chat loop
while True:
    user_input = input("You: ")
    
    if user_input.lower() in ["exit", "quit"]:
        print("Coach Bot: Take care! Remember, growth is a journey. 🌱")
        break
    
    # Add user input to chat history
    chat_history.append({"role": "user", "content": user_input})
    
    # Get response from OpenAI
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",  # Use "gpt-3.5-turbo" if needed
            messages=chat_history,
            temperature=0.8  # Adds some creativity
        )
        
        reply = response['choices'][0]['message']['content']
        chat_history.append({"role": "assistant", "content": reply})
        
        print(f"\nCoach Bot: {reply}\n")

    except Exception as e:
        print(f"Error: {e}")
        break
