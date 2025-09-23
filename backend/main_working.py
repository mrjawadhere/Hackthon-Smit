from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import working routes (without agents dependency for now)
# from routes import user_routes  # Temporarily disabled
from routes import analytics

app = FastAPI(
    title="Campus Admin API",
    description="API for managing campus admin operations",
    version="1.0.0",
    docs_url="/docs",          
    redoc_url="/redoc"         
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8080", "http://localhost:8080", "http://127.0.0.1:8081", "http://localhost:8081", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
def read_root():
    return {"message": "Campus Admin Backend is running!", "status": "success"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "campus-admin-backend"}

# Temporary simple user endpoints for testing
from pymongo.collection import Collection
from db.db import get_db
from utils.auth_utils import create_access_token, hash_password, verify_password
from model.model import LoginUser, UserCreate, ResetPasswordRequest
from bson import ObjectId
from fastapi import Depends

@app.post("/users/register")
def register_user(user: UserCreate, db=Depends(get_db)):
    try:
        users_collection: Collection = db["signup"]
        
        if users_collection.find_one({"email": user.email}):
            return {"message": "Email already registered", "status": "error", "data": None}
        
        user_hash_password = hash_password(user.password)
        user_doc = {
            "name": user.name,
            "email": user.email,
            "password": user_hash_password,
        }
        result = users_collection.insert_one(user_doc)
        db_user = users_collection.find_one({"_id": result.inserted_id})
        
        token = create_access_token(
            data={"email": db_user["email"], "name": db_user["name"], "user_id": str(db_user["_id"])}
        )
        
        return {
            "data": {"name": db_user["name"], "email": db_user["email"], "token": token},
            "message": "User registered successfully",
            "status": "success"
        }
    except Exception as e:
        return {"message": str(e), "status": "error", "data": None}

@app.post("/users/login")
def login_user(user: LoginUser, db=Depends(get_db)):
    try:
        users_collection: Collection = db["signup"]
        
        db_user = users_collection.find_one({"email": user.email})
        if not db_user:
            return {"message": "Email not found", "status": "error", "data": None}
        
        is_valid_password = verify_password(user.password, db_user["password"])
        if not is_valid_password:
            return {"message": "Invalid password", "status": "error", "data": None}
        
        token = create_access_token(
            data={"email": db_user["email"], "name": db_user["name"], "user_id": str(db_user["_id"])}
        )
        
        return {
            "data": {"name": db_user["name"], "email": db_user["email"], "token": token},
            "message": "User logged in successfully",
            "status": "success"
        }
    except Exception as e:
        return {"message": str(e), "status": "error", "data": None}

@app.post("/users/test-register")
def test_register():
    return {"message": "Registration endpoint reached", "status": "success"}

@app.post("/users/test-login")  
def test_login():
    return {"message": "Login endpoint reached", "status": "success"}

# Chat endpoint
from pydantic import BaseModel
from datetime import datetime

class ChatRequest(BaseModel):
    user_input: str

@app.post("/students/chat/{thread_id}")
def chat_endpoint(thread_id: str, request: ChatRequest, db=Depends(get_db)):
    try:
        user_input = request.user_input
        
        if not user_input:
            return {"error": "No user input provided", "status": "error"}
        
        # Simple AI response based on user input
        user_input_lower = user_input.lower()
        
        if "student" in user_input_lower and ("add" in user_input_lower or "create" in user_input_lower):
            response = "I can help you add a new student! Please provide the student's details like name, email, department, and enrollment date. For example: 'Add student John Doe, email: john@example.com, department: Computer Science, enrollment: 2024-01-15'"
        
        elif "student" in user_input_lower and ("show" in user_input_lower or "list" in user_input_lower or "all" in user_input_lower):
            try:
                student_count = db.students.count_documents({})
                response = f"I found {student_count} students in the database. Would you like me to show you specific details about any student or filter by department?"
            except:
                response = "I can show you all students in the system. The student database contains enrollment information, academic records, and contact details."
        
        elif "department" in user_input_lower:
            response = "Our campus has several departments including Computer Science, Engineering, Business Administration, Liberal Arts, and Sciences. Would you like information about a specific department?"
        
        elif "campus" in user_input_lower or "email" in user_input_lower:
            response = "Campus contact information:\\n- Main Email: admin@campus.edu\\n- Phone: (555) 123-4567\\n- Address: 123 University Ave\\n- Office Hours: Mon-Fri 9AM-5PM"
        
        elif "analytics" in user_input_lower or "statistics" in user_input_lower:
            try:
                total_students = db.students.count_documents({})
                active_students = db.students.count_documents({"status": "active"})
                response = f"📊 Campus Analytics:\\n- Total Students: {total_students}\\n- Active Students: {active_students}\\n- Departments: 5\\n- Current Semester: Fall 2024"
            except:
                response = "📊 Campus Analytics:\\n- Total Students: Loading...\\n- Active Students: Loading...\\n- Departments: 5\\n- Current Semester: Fall 2024"
        
        elif "help" in user_input_lower:
            response = """🤖 Campus AI Assistant - Available Commands:

📚 Student Management:
• "Add a new student" - Create student records
• "Show all students" - List student information
• "Find student by name/ID" - Search students

📊 Analytics:
• "Show statistics" - Campus analytics
• "Department breakdown" - Student distribution

🏢 Campus Info:
• "Campus contact info" - Phone, email, address
• "Department information" - Academic departments

Just ask me anything about students, campus operations, or analytics!"""
        
        else:
            response = f"I understand you're asking about: '{user_input}'. I'm the Campus AI assistant and I can help you with:\\n\\n• Student management (add, search, update students)\\n• Campus analytics and statistics\\n• Department information\\n• Contact details\\n\\nTry asking something like 'Show me all students' or 'Add a new student' or type 'help' for more options!"
        
        return {
            "response": response,
            "thread_id": thread_id,
            "timestamp": datetime.now().isoformat(),
            "user_input": user_input,
            "status": "success"
        }
        
    except Exception as e:
        return {"error": f"Chat error: {str(e)}", "status": "error"}

# Include routers
# app.include_router(user_routes.user_router, prefix="/users", tags=["User"])  # Temporarily disabled
app.include_router(analytics.analytics_router, prefix="/analytics", tags=["Analytics"])

# TODO: Add student chat router once agents dependency is resolved
# app.include_router(student_routes.student_router, prefix="/students", tags=["Student"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main_working:app", host="0.0.0.0", port=5050, reload=True)