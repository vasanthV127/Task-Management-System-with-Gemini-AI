from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import AICommand, AIResponse, TaskCreate, TaskUpdate
from app.services.ai_service import AIService
from app.services.task_service import TaskService
from app.middleware.auth import get_current_user

router = APIRouter()

@router.post("/command", response_model=AIResponse)
def process_ai_command(
    command: AICommand,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process a natural language command using AI.
    
    The AI interprets intent and returns structured data.
    All actions are validated through TaskService (same as manual UI actions).
    """
    
    # Step 1: Interpret command using AI (untrusted input layer)
    intent = AIService.interpret_command(command.command)
    
    if intent.get("action") == "ERROR":
        return AIService.format_response(
            success=False,
            message=intent.get("message", "Failed to interpret command")
        )
    
    action = intent.get("action")
    
    try:
        # Step 2: Execute action through TaskService (trusted business logic)
        
        if action == "CREATE":
            # Create new task
            title = intent.get("title", "").strip()
            if not title:
                return AIService.format_response(
                    success=False,
                    message="Could not understand the task title. Please try again."
                )
            
            task_data = TaskCreate(
                title=title,
                description=intent.get("description", "")
            )
            task = TaskService.create_task(db, task_data, current_user.id)
            
            return AIService.format_response(
                success=True,
                message=f"✅ Task '{task.title}' created successfully",
                data={"task_id": task.id, "title": task.title, "state": task.state},
                action="CREATE"
            )
        
        elif action == "UPDATE_STATE":
            # Update task state
            task_identifier = intent.get("task_identifier", "").strip()
            new_state = intent.get("new_state")
            
            if not task_identifier:
                return AIService.format_response(
                    success=False,
                    message="Could not identify which task to update. Please specify the task name."
                )
            
            # Find task by title
            tasks = TaskService.find_tasks_by_title(db, task_identifier, current_user.id)
            
            if not tasks:
                return AIService.format_response(
                    success=False,
                    message=f"No task found matching '{task_identifier}'"
                )
            
            if len(tasks) > 1:
                task_list = ", ".join([f"'{t.title}'" for t in tasks[:3]])
                return AIService.format_response(
                    success=False,
                    message=f"Multiple tasks found matching '{task_identifier}': {task_list}. Please be more specific."
                )
            
            task = tasks[0]
            
            # Update state through TaskService (validates state transition)
            task_update = TaskUpdate(state=new_state)
            updated_task = TaskService.update_task(db, task.id, task_update, current_user.id)
            
            return AIService.format_response(
                success=True,
                message=f"✅ Task '{updated_task.title}' moved to '{updated_task.state}'",
                data={"task_id": updated_task.id, "title": updated_task.title, "state": updated_task.state},
                action="UPDATE_STATE"
            )
        
        elif action == "VIEW":
            # View tasks
            filter_state = intent.get("filter_state")
            
            if filter_state:
                tasks = TaskService.get_tasks_by_state(db, filter_state, current_user.id)
                message = f"Found {len(tasks)} task(s) in '{filter_state}' state"
            else:
                tasks = TaskService.get_all_tasks(db, current_user.id)
                message = f"Found {len(tasks)} total task(s)"
            
            tasks_data = [
                {"id": t.id, "title": t.title, "state": t.state, "description": t.description}
                for t in tasks
            ]
            
            return AIService.format_response(
                success=True,
                message=message,
                data={"tasks": tasks_data, "count": len(tasks)},
                action="VIEW"
            )
        
        elif action == "DELETE":
            # Delete task
            task_identifier = intent.get("task_identifier", "").strip()
            
            if not task_identifier:
                return AIService.format_response(
                    success=False,
                    message="Could not identify which task to delete. Please specify the task name."
                )
            
            tasks = TaskService.find_tasks_by_title(db, task_identifier, current_user.id)
            
            if not tasks:
                return AIService.format_response(
                    success=False,
                    message=f"No task found matching '{task_identifier}'"
                )
            
            if len(tasks) > 1:
                task_list = ", ".join([f"'{t.title}'" for t in tasks[:3]])
                return AIService.format_response(
                    success=False,
                    message=f"Multiple tasks found matching '{task_identifier}': {task_list}. Please be more specific."
                )
            
            task = tasks[0]
            TaskService.delete_task(db, task.id, current_user.id)
            
            return AIService.format_response(
                success=True,
                message=f"✅ Task '{task.title}' deleted successfully",
                data={"task_id": task.id, "title": task.title},
                action="DELETE"
            )
        
        elif action == "UPDATE_DETAILS":
            # Update task title or description
            task_identifier = intent.get("task_identifier", "").strip()
            new_title = intent.get("title")
            new_description = intent.get("description")
            
            if not task_identifier:
                return AIService.format_response(
                    success=False,
                    message="Could not identify which task to update."
                )
            
            tasks = TaskService.find_tasks_by_title(db, task_identifier, current_user.id)
            
            if not tasks:
                return AIService.format_response(
                    success=False,
                    message=f"No task found matching '{task_identifier}'"
                )
            
            if len(tasks) > 1:
                return AIService.format_response(
                    success=False,
                    message=f"Multiple tasks found. Please be more specific."
                )
            
            task = tasks[0]
            task_update = TaskUpdate(title=new_title, description=new_description)
            updated_task = TaskService.update_task(db, task.id, task_update, current_user.id)
            
            return AIService.format_response(
                success=True,
                message=f"✅ Task updated successfully",
                data={"task_id": updated_task.id, "title": updated_task.title},
                action="UPDATE_DETAILS"
            )
        
        else:
            return AIService.format_response(
                success=False,
                message=f"Unknown action: {action}. I can help you create, update, view, or delete tasks."
            )
    
    except HTTPException as e:
        # Handle validation errors from TaskService
        return AIService.format_response(
            success=False,
            message=e.detail
        )
    except Exception as e:
        return AIService.format_response(
            success=False,
            message=f"Error executing command: {str(e)}"
        )
