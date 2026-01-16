from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import User
from app.schemas import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import TaskService
from app.middleware.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new task (starts in 'Not Started' state)."""
    return TaskService.create_task(db, task_data, current_user.id)

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    state: Optional[str] = Query(None, description="Filter by state: 'Not Started', 'In Progress', or 'Completed'"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all tasks or filter by state."""
    if state:
        return TaskService.get_tasks_by_state(db, state, current_user.id)
    return TaskService.get_all_tasks(db, current_user.id)

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific task by ID."""
    task = TaskService.get_task_by_id(db, task_id, current_user.id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a task (with state transition validation)."""
    return TaskService.update_task(db, task_id, task_data, current_user.id)

@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a task."""
    TaskService.delete_task(db, task_id, current_user.id)
    return None
