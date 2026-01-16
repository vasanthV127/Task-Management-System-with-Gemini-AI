import google.generativeai as genai
import os
import json
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class AIService:
    """
    AI Service for interpreting natural language commands.
    
    IMPORTANT: This service ONLY interprets intent and returns structured data.
    It does NOT contain business logic or directly modify the database.
    All actions must be validated through TaskService.
    """
    
    SYSTEM_PROMPT = """You are an AI assistant for a task management system. Your job is to interpret user commands and return structured JSON.

Available actions:
- CREATE: Create a new task
- UPDATE_STATE: Change task state (Not Started → In Progress → Completed)
- DELETE: Delete a task
- VIEW: View tasks (all or filtered by state)
- UPDATE_DETAILS: Update task title or description

Valid states (must use exactly):
- "Not Started"
- "In Progress"
- "Completed"

State transition rules:
- Not Started → In Progress (allowed)
- In Progress → Completed (allowed)
- All other transitions are INVALID

Return ONLY valid JSON in this format:
{
  "action": "CREATE|UPDATE_STATE|DELETE|VIEW|UPDATE_DETAILS",
  "task_identifier": "task title or keywords to search",
  "new_state": "Not Started|In Progress|Completed",
  "title": "new task title",
  "description": "task description",
  "filter_state": "Not Started|In Progress|Completed"
}

Examples:
- "Add a task to prepare presentation" → {"action": "CREATE", "title": "prepare presentation"}
- "Start working on presentation" → {"action": "UPDATE_STATE", "task_identifier": "presentation", "new_state": "In Progress"}
- "Mark presentation as completed" → {"action": "UPDATE_STATE", "task_identifier": "presentation", "new_state": "Completed"}
- "Show all completed tasks" → {"action": "VIEW", "filter_state": "Completed"}
- "Delete presentation task" → {"action": "DELETE", "task_identifier": "presentation"}

Return ONLY the JSON object, no other text."""

    @staticmethod
    def interpret_command(command: str) -> Dict[str, Any]:
        """
        Interprets a natural language command using Gemini AI.
        Returns structured intent data that will be validated by TaskService.
        """
        if not GEMINI_API_KEY:
            raise Exception("GEMINI_API_KEY not configured. Please set it in .env file")
        
        try:
            # List available models and use the first generative one
            try:
                available_models = genai.list_models()
                # Find first model that supports generateContent
                model_name = None
                for m in available_models:
                    if 'generateContent' in m.supported_generation_methods:
                        model_name = m.name
                        break
                
                if not model_name:
                    raise Exception("No suitable Gemini model found")
                
                model = genai.GenerativeModel(model_name)
            except:
                # Fallback to direct model name without models/ prefix
                model = genai.GenerativeModel('gemini-pro')
            
            full_prompt = f"{AIService.SYSTEM_PROMPT}\n\nUser command: {command}\n\nJSON response:"
            
            response = model.generate_content(full_prompt)
            response_text = response.text.strip()
            
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            response_text = response_text.strip()
            
            # Parse JSON
            intent = json.loads(response_text)
            
            return intent
            
        except json.JSONDecodeError as e:
            return {
                "action": "ERROR",
                "message": f"Failed to parse AI response: {str(e)}"
            }
        except Exception as e:
            return {
                "action": "ERROR",
                "message": f"AI error: {str(e)}"
            }
    
    @staticmethod
    def format_response(success: bool, message: str, data: Any = None, action: str = None) -> Dict[str, Any]:
        """Format a consistent response."""
        return {
            "success": success,
            "message": message,
            "data": data,
            "action": action
        }
