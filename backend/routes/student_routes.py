from fastapi import FastAPI, APIRouter, HTTPException, Body
from typing import Dict
from pydantic import BaseModel
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import os

# --------- Load environment variables ----------
load_dotenv()

# --------- MongoDB Setup ----------
from db.db import get_db
db = get_db()
client = db["hackathon_smit"]
chats_collection = client["chats"]
students_collection = client["students"]
# --------- OpenAI + Agents ----------
from agents import Agent, OpenAIChatCompletionsModel, ModelSettings, Runner  # type: ignore
from openai import AsyncOpenAI  # type: ignore
from tools.student_tool import      add_student,read_students, update_student, delete_student,read_student_by_id
from tools.campus_faq import rag_query

openai_client = AsyncOpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)
agent = Agent(
    name="StudentDataAgent",
    instructions="""
You are an AI assistant that helps manage student records. You can perform the following actions:
- Add a new student record.
- Read existing student records.
- Update student records.
- Delete student records.
When responding to user queries, use the tools provided to interact with the student database as needed. Always ensure that you confirm actions with the user before making changes to the database.
If the user asks for information about students, use the read_students or read_student tool.
If the user wants to add, update, or delete a student, use the respective tool and confirm the action with the user.
For general campus-related questions, use the rag_query tool to provide accurate information based on the campus FAQ documents.
    """,
    model=OpenAIChatCompletionsModel(
        model="gemini-2.5-flash",
        openai_client=openai_client
    ),
    tools=[read_students, add_student, delete_student, update_student, read_student_by_id, rag_query],
    model_settings=ModelSettings(temperature=0.7,
                                 max_tokens=1000
                                  ),
)


student_router = APIRouter()

# --------- Request Model ----------
class ChatRequest(BaseModel):
    user_input: str = None

# ---------  Save message ----------
def save_message(thread_id: str, role: str, content: str):
    chat_doc = {
        "thread_id": thread_id,
        "role": role,
        "content": content,
        "timestamp": datetime.utcnow()
    }
    result = chats_collection.insert_one(chat_doc)
    chat_doc["id"] = str(result.inserted_id)
    return chat_doc

# --------- Chat Endpoint ----------
@student_router.post("/chat/{thread_id}")
async def chat_endpoint(thread_id: str, request: ChatRequest = Body(...)) -> Dict:
    try:
    
        user_text = request.user_input.strip() if request.user_input else None
        if not user_text:
            raise HTTPException(status_code=400, detail="User input cannot be empty.")

       
        save_message(thread_id, "user", user_text)

        # Fetch last 10 messages as context
        history_cursor = chats_collection.find({"thread_id": thread_id}).sort("timestamp", -1).limit(10)
        history = list(history_cursor)[::-1]  # reverse to oldest→newest

        messages = [{"role": doc["role"], "content": doc["content"]} for doc in history]

        # Add the latest user input
        messages.append({"role": "user", "content": user_text})

        # ✅ Run agent with plain messages
        result = await Runner.run(agent, messages)
        assistant_reply = result.final_output

        # Save assistant reply
        save_message(thread_id, "assistant", assistant_reply)

        # Fetch full thread history for response
        full_history_cursor = chats_collection.find({"thread_id": thread_id}).sort("timestamp", 1)
        full_history = [
            {
                "id": str(doc["_id"]),
                "thread_id": doc["thread_id"],
                "role": doc["role"],
                "content": doc["content"],
                "timestamp": doc["timestamp"]
            }
            for doc in full_history_cursor
        ]

        return {
            "thread_id": thread_id,
            "response": assistant_reply,
            "history": full_history
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")
