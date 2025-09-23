from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import student_routes
load_dotenv()

from routes import user_routes
from routes import analytics

app = FastAPI(
    title="Login and Agent Management API",
    description="API for managing user logins and agent information",
    version="1.0.0",
    docs_url="/docs",          
    redoc_url="/redoc"         
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8080",
        "http://localhost:8080",
        "http://127.0.0.1:8081",
        "http://localhost:8081",
    ],  # Frontend dev URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(student_routes.student_router, prefix="/students", tags=["Student"])
app.include_router(user_routes.user_router, prefix="/users", tags=["User"])
app.include_router(analytics.analytics_router, prefix="/analytics", tags=["Analytics"])


if __name__ == "__main__":
    # for local dev only
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5050, reload=True)

