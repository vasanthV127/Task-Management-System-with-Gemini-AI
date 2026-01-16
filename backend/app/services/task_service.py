from sqlalchemy.orm import Session
from app.models import Task
from app.schemas import TaskCreate, TaskUpdate
from fastapi import HTTPException
from typing import List, Optional

# STATE MACHINE - CENTRALIZED BUSINESS LOGIC
# This is the core state transition logic that MUST NOT be in UI or AI code
STATE_TRANSITIONS = {
    "Not Started": ["In Progress"],
    "In Progress": ["Completed"],
    "Completed": []
}

VALID_STATES = ["Not Started", "In Progress", "Completed"]

class TaskService:
    """
    Centralized business logic for task management.
    This service contains all state transition rules and validation.
    Both UI and AI must use this service - they cannot bypass it.
    """
    
    @staticmethod
    def validate_state_transition(current_state: str, new_state: str) -> bool:
        """
        Validates if a state transition is allowed.
        
        Rules:
        - Not Started → In Progress (allowed)
        - In Progress → Completed (allowed)
        - All other transitions are invalid
        """
        if new_state not in VALID_STATES:
            return False
        
        if current_state == new_state:
            return True
        
        allowed_transitions = STATE_TRANSITIONS.get(current_state, [])
        return new_state in allowed_transitions
    
    @staticmethod
    def create_task(db: Session, task_data: TaskCreate, user_id: int) -> Task:
        """Create a new task in 'Not Started' state."""
        task = Task(
            title=task_data.title,
            description=task_data.description or "",
            state="Not Started",
            owner_id=user_id
        )
        db.add(task)
        db.commit()
        db.refresh(task)
        return task
    
    @staticmethod
    def get_task_by_id(db: Session, task_id: int, user_id: int) -> Optional[Task]:
        """Get a specific task by ID for the current user."""
        return db.query(Task).filter(
            Task.id == task_id, 
            Task.owner_id == user_id
        ).first()
    
    @staticmethod
    def get_all_tasks(db: Session, user_id: int) -> List[Task]:
        """Get all tasks for the current user."""
        return db.query(Task).filter(Task.owner_id == user_id).order_by(Task.created_at.desc()).all()
    
    @staticmethod
    def get_tasks_by_state(db: Session, state: str, user_id: int) -> List[Task]:
        """Filter tasks by state."""
        if state not in VALID_STATES:
            raise HTTPException(status_code=400, detail=f"Invalid state. Must be one of: {VALID_STATES}")
        
        return db.query(Task).filter(
            Task.owner_id == user_id,
            Task.state == state
        ).order_by(Task.created_at.desc()).all()
    
    @staticmethod
    def update_task(db: Session, task_id: int, task_data: TaskUpdate, user_id: int) -> Task:
        """Update a task with validation."""
        task = TaskService.get_task_by_id(db, task_id, user_id)
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Update title and description
        if task_data.title is not None:
            task.title = task_data.title
        if task_data.description is not None:
            task.description = task_data.description
        
        # Handle state transition with validation
        if task_data.state is not None:
            if not TaskService.validate_state_transition(task.state, task_data.state):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid state transition: '{task.state}' → '{task_data.state}'. "
                           f"Allowed transitions from '{task.state}': {STATE_TRANSITIONS.get(task.state, [])}"
                )
            task.state = task_data.state
        
        db.commit()
        db.refresh(task)
        return task
    
    @staticmethod
    def delete_task(db: Session, task_id: int, user_id: int) -> bool:
        """Delete a task."""
        task = TaskService.get_task_by_id(db, task_id, user_id)
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        db.delete(task)
        db.commit()
        return True
    
    @staticmethod
    def find_task_by_title(db: Session, title: str, user_id: int) -> Optional[Task]:
        """Find a task by title (case-insensitive partial match)."""
        return db.query(Task).filter(
            Task.owner_id == user_id,
            Task.title.ilike(f"%{title}%")
        ).first()
    
    @staticmethod
    def find_tasks_by_title(db: Session, title: str, user_id: int) -> List[Task]:
        """Find all tasks matching a title (case-insensitive partial match)."""
        return db.query(Task).filter(
            Task.owner_id == user_id,
            Task.title.ilike(f"%{title}%")
        ).all()
