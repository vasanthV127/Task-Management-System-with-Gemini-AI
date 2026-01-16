from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import tasks, ai, auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Task Management System with AI",
    description="A task management system with Gemini AI integration",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Assistant"])

@app.get("/")
def read_root():
    return {
        "message": "Task Management System API",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
