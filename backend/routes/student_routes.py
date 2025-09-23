from fastapi import FastAPI, APIRouter, HTTPException, Body
from typing import Dict
from pydantic import BaseModel
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import os
import re

# --------- Load environment variables ----------
load_dotenv()

# --------- MongoDB Setup ----------
from db.db import get_db
db = get_db()  # get_db returns the 'hackathon_smit' Database instance
chats_collection = db["chats"]
students_collection = db["students"]
from email_utils.email import _send_welcome_email
# --------- OpenAI + Agents ----------
AGENT_AVAILABLE = False
agent = None
Runner = None

# Only attempt to import the optional agents stack when explicitly enabled.
# This avoids heavy imports and network initialization on startup.
ENABLE_AGENT = os.getenv("ENABLE_AGENT", "0") == "1"

if ENABLE_AGENT:
    try:
        from agents import Agent, OpenAIChatCompletionsModel, ModelSettings, Runner  # type: ignore
        from openai import AsyncOpenAI  # type: ignore
        from tools.student_tool import (
            add_student,
            read_students,
            update_student,
            delete_student,
            read_student_by_id,
        )
        from tools.campus_faq import rag_query

        if os.getenv("GEMINI_API_KEY"):
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
                    openai_client=openai_client,
                ),
                tools=[
                    read_students,
                    add_student,
                    delete_student,
                    update_student,
                    read_student_by_id,
                    rag_query,
                ],
                model_settings=ModelSettings(temperature=0.7, max_tokens=1000),
            )
            AGENT_AVAILABLE = True
    except Exception:
        # Agent stack is optional; we'll use a safe fallback response
        AGENT_AVAILABLE = False


student_router = APIRouter()

# --------- Request Model ----------
class ChatRequest(BaseModel):
    user_input: str | None = None

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

# --------- Simple NLP: Extract student info & auto-insert ----------
def _extract_email(text: str) -> str | None:
    m = re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    return m.group(0) if m else None

def _extract_id(text: str) -> int | None:
    m = re.search(r"\b(?:id|student id|roll(?:\s*no\.?|\s*number)?)\s*(?:is|:)?\s*(\d{1,12})\b", text, re.IGNORECASE)
    try:
        return int(m.group(1)) if m else None
    except Exception:
        return None

def _extract_name(text: str) -> str | None:
    # e.g., "my name is John Doe" or "name: John Doe"
    m = re.search(r"\b(?:my\s+name\s+is|name\s*:?)\s+([A-Za-z][A-Za-z\s'\-]{1,50})", text, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    # fallback: "I am John Doe"
    m2 = re.search(r"\bI\s+am\s+([A-Za-z][A-Za-z\s'\-]{1,50})", text)
    return m2.group(1).strip() if m2 else None

def _extract_department(text: str) -> str | None:
    # "department is X" or "in the X department"
    m = re.search(r"\bdepartment\s*(?:is|:)?\s*([A-Za-z][\w\s&\-]{1,50})", text, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    m2 = re.search(r"\bin\s+(?:the\s+)?([A-Za-z][\w\s&\-]{1,50})\s+department\b", text, re.IGNORECASE)
    return m2.group(1).strip() if m2 else None

def _extract_age(text: str) -> int | None:
    m = re.search(r"\bage\s*(?:is|:)?\s*(\d{1,3})\b", text, re.IGNORECASE)
    try:
        return int(m.group(1)) if m else None
    except Exception:
        return None

def try_auto_add_student_from_text(text: str) -> str | None:
    """
    Attempt to parse an "add student" intent and insert into DB.
    Returns a user-friendly assistant reply if handled, else None.
    """
    # Detect phrases like: "add student", "add a new student", "register an admission", "enroll student", "admit student" etc.
    if not re.search(r"\b(add|create|register|enroll|admit)\b.*\b(student|admission|enrollment)\b", text, re.IGNORECASE):
        return None

    sid = _extract_id(text)
    name = _extract_name(text)
    email = _extract_email(text)
    dept = _extract_department(text)
    age = _extract_age(text)

    missing = []
    if sid is None:
        missing.append("id")
    if not name:
        missing.append("name")
    if not email:
        missing.append("email")

    if missing:
        return (
            "I can add the student, but I'm missing: " + ", ".join(missing) + 
            ". Please provide them, e.g., 'My id is 123, my name is John Doe, my email is john@example.com'."
        )

    # Ensure unique id
    if students_collection.find_one({"id": sid}):
        return f"A student with id={sid} already exists. Please use a different id or update the existing record."

    doc = {
        "id": sid,
        "name": name,
        "email": email,
        "department": dept,
    }
    if age is not None:
        doc["age"] = age

    result = students_collection.insert_one(doc)
    # try sending email but don't fail if it errors
    email_status = "not sent"
    try:
        if email:
            _send_welcome_email(email, name, dept)
            email_status = f"sent to {email}"
    except Exception as e:
        email_status = f"failed: {str(e)}"

    return (
        f"Student added successfully with id={sid}. "
        + (f"Department: {dept}. " if dept else "")
        + f"Welcome email {email_status}."
    )

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

        assistant_reply: str

        # First try lightweight auto-add intent without heavy agent stack
        auto_add_reply = try_auto_add_student_from_text(user_text)
        if auto_add_reply:
            assistant_reply = auto_add_reply
        else:
            if AGENT_AVAILABLE and agent is not None and Runner is not None:
                try:
                    # Instantiate runner and run agent
                    runner = Runner()
                    result = await runner.run(agent, messages)
                    assistant_reply = str(getattr(result, "final_output", "")) or "(no response)"
                except Exception:
                    # Fallback if agent execution fails
                    assistant_reply = (
                        f'I received your message: "{user_text}". The AI agent is initializing. '
                        "You can ask about student records, departments, campus info, or simple analytics."
                    )
            else:
                # No agent stack available; return a safe, deterministic reply
                assistant_reply = (
                    f'I received your message: "{user_text}". The AI agent is initializing. '
                    "You can ask about student records, departments, campus info, or simple analytics."
                )

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

    except HTTPException:
        # pass through FastAPI HTTP exceptions as-is
        raise
    except Exception as e:
        # On unexpected errors, return a friendly message instead of a 500 that breaks the UI
        try:
            # Try to at least persist the error as an assistant note for traceability
            save_message(thread_id, "assistant", f"An error occurred, but your message was received: {str(e)}")
        except Exception:
            pass
        return {
            "thread_id": thread_id,
            "response": "Something went wrong, but your message was received. Please try again shortly.",
            "history": [],
        }
