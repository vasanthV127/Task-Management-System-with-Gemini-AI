# Task Management System with Gemini AI

A modern task management application that combines traditional UI interactions with natural language AI commands powered by Google Gemini.

## 🎯 Project Overview

This application demonstrates **separation of concerns** by treating AI as an **untrusted input interpretation layer** that triggers the same validated business logic used by manual UI actions. The system remains fully functional even if AI is disabled.

### Key Features

- ✅ **Full CRUD Operations**: Create, read, update, and delete tasks
- ✅ **State Machine**: Enforced state transitions (Not Started → In Progress → Completed)
- ✅ **AI Assistant**: Natural language command processing via Gemini AI
- ✅ **Authentication**: Secure JWT-based user authentication
- ✅ **Responsive UI**: Modern, clean interface with Tailwind CSS
- ✅ **Real-time Validation**: Centralized business logic prevents invalid operations

---

## 🏗️ Architecture

### Tech Stack

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy ORM with SQLite
- Pydantic for validation
- Google Gemini AI API
- JWT authentication

**Frontend:**
- React 18 with Vite
- Tailwind CSS
- Axios for API calls
- Lucide React icons

### System Architecture

```
┌─────────────────────────────────────────┐
│           USER INTERFACE                │
│  (React - Manual actions + AI input)    │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌─────────┐      ┌──────────────────┐
│ AI Layer│      │  REST API        │
│ (Gemini)│──────▶  (FastAPI)       │
└─────────┘      └────────┬─────────┘
                          │
                          ▼
              ┌──────────────────────┐
              │  Business Logic      │
              │  - TaskService       │
              │  - State Machine     │
              │  - Validation        │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Database (SQLite)   │
              └──────────────────────┘
```

**Critical Design Principle**: AI interprets user intent → Structured data → Validated through TaskService → Database

---

## 📋 Task Model & State Design

### Task Schema

```python
class Task:
    id: int                    # Primary key
    title: str                 # Task title (required)
    description: str           # Optional description
    state: str                 # Current state
    created_at: datetime       # Creation timestamp
    updated_at: datetime       # Last update timestamp
    owner_id: int             # Foreign key to User
```

### State Machine

**Valid States (Must use exactly):**
1. `Not Started` (Initial state)
2. `In Progress`
3. `Completed` (Terminal state)

**State Transition Rules:**

```
Not Started ──────────────────► In Progress
                                      │
                                      │
                                      ▼
                                 Completed
```

- ✅ **Allowed**: `Not Started` → `In Progress`
- ✅ **Allowed**: `In Progress` → `Completed`
- ❌ **Rejected**: All other transitions
- ❌ **Rejected**: `Completed` → Any state (terminal)
- ❌ **Rejected**: `Not Started` → `Completed` (must go through In Progress)

### State Validation Logic

All state transitions are validated through the centralized `TaskService`:

```python
# backend/app/services/task_service.py

STATE_TRANSITIONS = {
    "Not Started": ["In Progress"],
    "In Progress": ["Completed"],
    "Completed": []
}

def validate_state_transition(current_state: str, new_state: str) -> bool:
    """
    Centralized validation - NEVER bypassed by UI or AI
    """
    if new_state not in VALID_STATES:
        return False
    
    if current_state == new_state:
        return True
    
    allowed_transitions = STATE_TRANSITIONS.get(current_state, [])
    return new_state in allowed_transitions
```

**Why This Matters:**
- UI cannot bypass validation
- AI commands are validated the same way
- Prevents data corruption
- Ensures business rule consistency

---

## 🗄️ Database Design

### Database Choice: SQLite

**Reasons for choosing SQLite:**

1. ✅ **Zero Configuration**: No separate server setup required
2. ✅ **Perfect for Development**: Ideal for prototyping and demonstrations
3. ✅ **ACID Compliant**: Full transaction support
4. ✅ **Portable**: Single file database (easy to backup/share)
5. ✅ **Sufficient for Task**: Handles expected load easily

**When to Migrate:**
- Production deployment with multiple concurrent users → PostgreSQL
- Cloud deployment → PostgreSQL/MySQL
- Current setup → SQLite is perfect

### Schema

**Users Table:**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Tasks Table:**
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY,
    title VARCHAR NOT NULL,
    description VARCHAR DEFAULT '',
    state VARCHAR NOT NULL DEFAULT 'Not Started',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    owner_id INTEGER NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Relationships:**
- One User → Many Tasks (1:N)
- Cascade delete: Deleting user removes all their tasks

---

## 🤖 AI Integration

### How AI Input is Processed

**Step-by-Step Flow:**

1. **User Input**: User types natural language command
   ```
   "Start working on presentation task"
   ```

2. **AI Interpretation** (`AIService`): Gemini converts to structured intent
   ```json
   {
     "action": "UPDATE_STATE",
     "task_identifier": "presentation",
     "new_state": "In Progress"
   }
   ```

3. **Validation**: Intent passed to `TaskService`
   - Find task by title
   - Validate state transition
   - Check permissions

4. **Execution**: If valid, execute through same logic as UI
   ```python
   TaskService.update_task(db, task_id, {"state": "In Progress"}, user_id)
   ```

5. **Response**: User receives confirmation or error message

### AI System Prompt

The AI is instructed with strict rules:

```python
SYSTEM_PROMPT = """You are an AI assistant for a task management system. 
Your job is to interpret user commands and return structured JSON.

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
  "task_identifier": "task title or keywords",
  "new_state": "Not Started|In Progress|Completed",
  "title": "new task title",
  ...
}
"""
```

### Handling Ambiguous Commands

**1. Non-existent Tasks:**
```
User: "Start working on xyz"
AI Response: "No task found matching 'xyz'"
```

**2. Multiple Matches:**
```
User: "Delete task"
Tasks: ["task 1", "task 2", "task 3"]
AI Response: "Multiple tasks found: 'task 1', 'task 2', 'task 3'. 
              Please be more specific."
```

**3. Invalid State Transitions:**
```
User: "Mark task as completed" (task is in "Not Started")
Response: "Invalid state transition: 'Not Started' → 'Completed'.
           Allowed transitions from 'Not Started': ['In Progress']"
```

**4. Unclear Intent:**
```
User: "Do something with tasks"
AI Response: "Could not understand the command. Try:
              - 'Add a task to [title]'
              - 'Start working on [task name]'
              - 'Show all completed tasks'"
```

### AI as Untrusted Input Layer

**Security Principles:**

1. ✅ **Never Trust AI Output**: All AI responses are validated
2. ✅ **Same Validation as UI**: AI commands use identical business logic
3. ✅ **No Direct Database Access**: AI cannot bypass TaskService
4. ✅ **Permission Checks**: User ownership validated for all operations
5. ✅ **State Validation**: State machine rules enforced regardless of input source

**Code Example:**

```python
# ❌ WRONG - AI directly modifying database
def process_ai_command(command):
    intent = ai.interpret(command)
    db.execute(f"UPDATE tasks SET state = '{intent.state}'")  # DANGEROUS!

# ✅ CORRECT - AI triggers validated business logic
def process_ai_command(command):
    intent = AIService.interpret_command(command)
    # Same validation as manual UI actions
    TaskService.update_task(db, task_id, intent.data, user_id)
```

---

## 🔄 How AI Actions Map to Business Logic

### Mapping Table

| User Command | AI Action | TaskService Method | Validation |
|-------------|-----------|-------------------|-----------|
| "Add a task to X" | `CREATE` | `create_task()` | Title required, Auto: state="Not Started" |
| "Start working on X" | `UPDATE_STATE` | `update_task()` | Task exists, State transition valid |
| "Mark X as done" | `UPDATE_STATE` | `update_task()` | Task exists, State transition valid |
| "Show completed tasks" | `VIEW` | `get_tasks_by_state()` | State is valid |
| "Delete task X" | `DELETE` | `delete_task()` | Task exists, User owns task |

### Example Flow: Update Task State

**Manual UI Action:**
```javascript
// Frontend button click
onUpdateTask(taskId, { state: "In Progress" })
  ↓
// API call
PUT /api/tasks/123 { "state": "In Progress" }
  ↓
// Backend validates & executes
TaskService.update_task(db, 123, {"state": "In Progress"}, user_id)
```

**AI Command:**
```javascript
// User types: "Start working on presentation"
AI.processCommand("Start working on presentation")
  ↓
// Gemini returns intent
{ action: "UPDATE_STATE", task_identifier: "presentation", 
  new_state: "In Progress" }
  ↓
// Find task & validate
task = TaskService.find_task_by_title("presentation")
  ↓
// Same validation as UI!
TaskService.update_task(db, task.id, {"state": "In Progress"}, user_id)
```

**Both paths converge at the same validation layer!**

---

## 🚀 Setup & Installation

### Prerequisites

- Python 3.9+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env and add your Gemini API key
# Get free API key: https://ai.google.dev/gemini-api/docs/api-key

# Run the server
uvicorn app.main:app --reload
```

Backend will run on: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

### Getting Gemini API Key

1. Visit: https://ai.google.dev/gemini-api/docs/api-key
2. Click "Get API Key"
3. Sign in with Google account
4. Create new API key (free tier, no credit card required)
5. Copy key to `backend/.env`:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

---

## 📝 API Documentation

### Authentication Endpoints

**POST /api/auth/register**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**POST /api/auth/login**
```
Form data:
username=testuser&password=password123
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Task Endpoints (Protected)

**GET /api/tasks** - Get all tasks
**GET /api/tasks?state=Completed** - Filter by state
**POST /api/tasks** - Create task
**PUT /api/tasks/{id}** - Update task
**DELETE /api/tasks/{id}** - Delete task

### AI Endpoint (Protected)

**POST /api/ai/command**
```json
{
  "command": "Add a task to prepare presentation"
}
```

Response:
```json
{
  "success": true,
  "message": "✅ Task 'prepare presentation' created successfully",
  "data": {
    "task_id": 1,
    "title": "prepare presentation",
    "state": "Not Started"
  },
  "action": "CREATE"
}
```

---

## 🎯 Usage Examples

### Manual UI Operations

1. **Create Task**: Click "Add New Task" → Fill form → Submit
2. **Update State**: Click "Move to [Next State]" button on task card
3. **Delete Task**: Click trash icon → Confirm
4. **Filter Tasks**: Use dropdown to filter by state

### AI Commands

```
✅ "Add a task to prepare presentation"
✅ "Create a task for code review"
✅ "Start working on presentation"
✅ "Begin presentation task"
✅ "Mark presentation as completed"
✅ "Complete the presentation task"
✅ "Show all completed tasks"
✅ "Display tasks in progress"
✅ "Delete presentation task"
✅ "Remove code review task"
```

---

## 🧪 Testing the Application

### Test State Transition Validation

1. Create a task (starts in "Not Started")
2. Try AI command: "Mark [task] as completed"
3. Expected: Error - invalid transition
4. Correct flow: 
   - "Start working on [task]" → In Progress
   - "Mark [task] as completed" → Completed

### Test AI Ambiguity Handling

1. Create tasks: "presentation 1", "presentation 2"
2. Try: "Delete presentation"
3. Expected: "Multiple tasks found" error
4. Try: "Delete presentation 1" → Success

### Test Permission Isolation

1. Register two users
2. Create tasks as user 1
3. Login as user 2
4. Expected: Cannot see user 1's tasks

---

## 🔑 Key Architectural Decisions

### 1. **Centralized State Machine**

**Decision**: State transition logic in `TaskService`, not UI or AI

**Rationale**:
- Single source of truth
- Prevents inconsistent states
- Easy to modify rules
- Testable in isolation

**Trade-off**: Slightly more code, but significantly safer

### 2. **AI as Input Layer Only**

**Decision**: AI interprets intent, doesn't execute business logic

**Rationale**:
- AI output is unpredictable
- Business rules must be deterministic
- System works without AI
- Security: AI cannot bypass validation

**Trade-off**: More code in AI router, but proper separation of concerns

### 3. **SQLite vs PostgreSQL**

**Decision**: SQLite for this task

**Rationale**:
- No setup overhead
- Perfect for demo/development
- ACID compliant
- Easy to version control

**Trade-off**: Not suitable for production with concurrent users (but perfect for this task)

### 4. **JWT Authentication**

**Decision**: Simple JWT tokens

**Rationale**:
- Stateless
- Easy to implement
- Suitable for demo
- Standard practice

**Trade-off**: No refresh tokens (fine for 4-hour task)

### 5. **FastAPI over Django**

**Decision**: FastAPI for backend

**Rationale**:
- Faster development
- Automatic API docs
- Async support for AI calls
- Modern Python features
- Less boilerplate

**Trade-off**: Less built-in features than Django (but we don't need them)

---

## 📂 Project Structure

```
task-management-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── database.py          # SQLite setup
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── services/
│   │   │   ├── task_service.py  # BUSINESS LOGIC & STATE MACHINE
│   │   │   └── ai_service.py    # Gemini AI integration
│   │   ├── routers/
│   │   │   ├── tasks.py         # Task CRUD endpoints
│   │   │   ├── ai.py            # AI command endpoint
│   │   │   └── auth.py          # Authentication endpoints
│   │   └── middleware/
│   │       └── auth.py          # JWT validation
│   ├── requirements.txt
│   ├── .env.example
│   └── tasks.db                 # SQLite database (created on first run)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx         # Login/Register
│   │   │   ├── TaskList.jsx     # Task display
│   │   │   ├── TaskCard.jsx     # Individual task
│   │   │   ├── TaskForm.jsx     # Create task form
│   │   │   └── AIChat.jsx       # AI assistant interface
│   │   ├── services/
│   │   │   └── api.js           # Axios API calls
│   │   ├── App.jsx              # Main component
│   │   └── main.jsx             # Entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md                     # This file
```

---

## 🎥 Video Demonstration Points

### Video 1: Architecture & Code Walkthrough

1. **Project Structure**: Explain folder organization
2. **State Machine**: Show `task_service.py` - centralized validation
3. **Database Schema**: Show models and relationships
4. **AI Integration**: Explain `ai_service.py` - intent interpretation
5. **API Endpoints**: Show FastAPI docs (`/docs`)
6. **Frontend Components**: React component structure
7. **Key Design Decisions**: Why separation of concerns matters

### Video 2: Working Application Demo

1. **Authentication**: Register → Login
2. **Manual Task Operations**:
   - Create task
   - Update state (show state progression)
   - Try invalid transition (show error)
   - Delete task
3. **AI Commands**:
   - "Add a task to prepare demo video"
   - "Start working on demo video"
   - "Show all tasks in progress"
   - "Mark demo video as completed"
4. **Edge Cases**:
   - Ambiguous command (multiple tasks)
   - Invalid state transition via AI
   - Non-existent task
5. **Filter & View**: Show filtering by state

---

## 🛡️ Security Considerations

1. **Password Hashing**: bcrypt for secure password storage
2. **JWT Tokens**: Stateless authentication
3. **SQL Injection**: Prevented by SQLAlchemy ORM
4. **CORS**: Configured for localhost (update for production)
5. **Input Validation**: Pydantic validates all inputs
6. **User Isolation**: Tasks filtered by owner_id
7. **AI Validation**: All AI outputs validated like manual input

---

## 🔮 Future Enhancements

1. **Task Priority**: Add high/medium/low priority
2. **Due Dates**: Add deadline tracking
3. **Tags/Categories**: Organize tasks
4. **Task Dependencies**: "Task B requires Task A"
5. **Collaborative Tasks**: Share tasks with other users
6. **More AI Capabilities**: "What tasks are overdue?", "Suggest next task"
7. **Notifications**: Email/push notifications
8. **Analytics**: Task completion metrics

---

## 📊 Time Breakdown

- Backend Setup: 1.5 hours
- Frontend Development: 1.5 hours
- AI Integration: 45 minutes
- Testing & Debugging: 45 minutes
- Documentation: 30 minutes
- **Total**: ~4.5 hours

---

## 🙏 Acknowledgments

- **Google Gemini API**: For natural language processing
- **FastAPI**: For excellent documentation and DX
- **React & Vite**: For fast frontend development
- **Tailwind CSS**: For rapid UI styling

---

## 📄 License

This project is created for educational purposes as part of a take-home assignment.

---

## 👨‍💻 Author

Built with ❤️ for Victopia Labs Software Developer Role

**Submission Date**: January 18, 2026

---

## 🆘 Troubleshooting

### Backend won't start
- Ensure virtual environment is activated
- Check `.env` file exists with Gemini API key
- Run `pip install -r requirements.txt`

### Frontend won't start
- Run `npm install`
- Check Node.js version (16+)
- Clear cache: `npm cache clean --force`

### AI commands not working
- Verify `GEMINI_API_KEY` in `.env`
- Check backend console for errors
- Ensure you're logged in

### Database errors
- Delete `tasks.db` file
- Restart backend (will recreate database)

### CORS errors
- Check backend is running on port 8000
- Check frontend is running on port 5173
- Verify CORS settings in `backend/app/main.py`

---

**Ready to run? Follow the Setup & Installation section above!** 🚀
