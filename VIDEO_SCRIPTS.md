# Video Scripts for Task Management System with Gemini AI

## Video 1: Architecture & Code Walkthrough (2-5 minutes)

### Opening (15 seconds)
**[Show project folder structure]**

"Hello! I'm presenting my Task Management System with Gemini AI integration. This project demonstrates clean architecture, separation of concerns, and proper AI integration as an untrusted input layer."

---

### Tech Stack Overview (20 seconds)
**[Show README.md or VS Code with both folders open]**

"The tech stack is:
- **Backend**: FastAPI with Python - modern, fast, async support
- **Frontend**: React with Tailwind CSS - responsive, clean UI
- **Database**: SQLite with SQLAlchemy ORM
- **AI**: Google Gemini API for natural language processing
- **Auth**: JWT-based authentication"

---

### Project Structure (30 seconds)
**[Show folder tree in VS Code]**

"The project has clear separation:
- **Backend folder** contains the FastAPI application
- **Frontend folder** contains the React application
- Notice there's NO business logic in the frontend related to state transitions - that's intentional"

---

### Core Architecture - State Machine (1 minute)
**[Open backend/app/services/task_service.py]**

"This is THE MOST IMPORTANT file. Let me show you the state machine.

**[Scroll to STATE_TRANSITIONS dictionary]**

Here we define the valid state transitions:
- Not Started can ONLY go to In Progress
- In Progress can ONLY go to Completed
- Completed is terminal - no transitions allowed

**[Scroll to validate_state_transition function]**

This validation function is centralized here. Both manual UI actions AND AI commands must pass through this same validation. This is the core requirement - AI cannot bypass business logic.

**[Scroll to update_task function]**

See here - when updating a task state, we call validate_state_transition. If invalid, it raises an HTTP exception. This ensures data integrity."

---

### AI Integration (45 seconds)
**[Open backend/app/services/ai_service.py]**

"Now the AI service. This is treated as an UNTRUSTED input layer.

**[Show interpret_command function]**

The AI's job is simple:
1. Take natural language input
2. Call Gemini API
3. Return structured JSON with action and parameters

**[Scroll to SYSTEM_PROMPT]**

I give Gemini explicit instructions about valid states and actions. But critically - Gemini doesn't execute anything. It just interprets intent.

**[Open backend/app/routers/ai.py]**

Here's where AI output meets business logic. After AI returns the intent, we validate everything through TaskService - the same service used by manual UI actions."

---

### Database Design (20 seconds)
**[Open backend/app/models.py]**

"Simple, effective schema:
- Users table with authentication
- Tasks table with foreign key to users
- State field storing current state
- Cascade delete ensures data integrity"

---

### API Endpoints (20 seconds)
**[Open backend/app/main.py OR show Swagger docs at localhost:8000/docs]**

"FastAPI gives us automatic API documentation. We have:
- Auth endpoints for register/login
- Task CRUD endpoints
- AI command endpoint

All protected with JWT middleware."

---

### Key Design Decisions (30 seconds)
**[Back to README or just face camera]**

"Three critical architectural decisions:

1. **Centralized State Machine**: Single source of truth in TaskService - not in UI, not in AI
2. **AI as Input Layer**: Gemini interprets intent but cannot bypass validation
3. **SQLite for Development**: Perfect for demos, ACID compliant, zero setup. Would use PostgreSQL in production.

These decisions ensure the system is maintainable, testable, and secure."

---

### Closing (10 seconds)

"This architecture demonstrates separation of concerns and treats AI appropriately - as an intelligent interface, not a privileged component. Thank you!"

---

## Video 2: Live Application Demo (2-5 minutes)

### Opening (10 seconds)
**[Show login page]**

"Let me demonstrate the fully working application. I'll show both manual operations and AI-powered features."

---

### Authentication (20 seconds)
**[Click Register]**

"First, I'll register a new account."

**[Fill: username: demo_user, email: demo@example.com, password: demo123]**

**[Click Register - should auto-login]**

"Successfully registered and logged in."

---

### Dashboard Overview (15 seconds)
**[Show the main dashboard]**

"Here's our dashboard with modern black and white theme. On the left - task management. On the right - AI assistant. At the top, we have task statistics showing completion rate."

---

### Manual Task Operations (1 minute)
**[Click "Add New Task"]**

"Let me create a task manually."

**[Type title: "Prepare demo video", description: "Record and edit submission video"]**

**[Click Create Task]**

"Task created in 'Not Started' state."

**[Create another: "Review code", "Final code review before submission"]**

"Created another task."

**[Click "Move to In Progress" on the first task]**

"Moving to In Progress - notice the state changes."

**[Try to create another task and attempt invalid transition - optional if time]**

**[Filter tasks - select "In Progress"]**

"I can filter by state - see only tasks in progress."

---

### AI Commands - Create Task (30 seconds)
**[Click in AI chat, type: "Add a task to write README"]**

**[Hit send, wait for response]**

"AI understood my intent and created a task. Notice it went through the same validation - created in 'Not Started' state."

**[Show task appears in left panel]**

---

### AI Commands - Update State (40 seconds)
**[Type: "Start working on README"]**

**[Send]**

"AI found the task and moved it to In Progress."

**[Show task updated in left panel]**

"Let's test invalid transitions."

**[Type: "Mark README as completed"]**

**[Send]**

"Successfully completed!"

**[Show all tasks, point to stats showing completion rate updated]**

---

### AI Commands - View & Filter (20 seconds)
**[Type: "Show all completed tasks"]**

**[Send]**

"AI returns filtered results."

**[Type: "Show all my tasks"]**

**[Send]**

"Shows all tasks."

---

### Error Handling (30 seconds)
**[Type: "Delete xyz task"]**

**[Send - should error: task not found]**

"Handles non-existent tasks gracefully."

**[Create two tasks with similar names like "presentation 1" and "presentation 2"]**

**[Type: "Delete presentation"]**

**[Send - should error: multiple matches]**

"Handles ambiguous commands - asks user to be more specific."

---

### Task Statistics (15 seconds)
**[Point to statistics dashboard]**

"Real-time statistics show:
- Total tasks: 6
- Not Started: 1
- In Progress: 2
- Completed: 3
- Completion rate: 50%"

---

### Responsive Design (10 seconds - optional if time)
**[Resize browser window or show on mobile view]**

"Fully responsive design works on all screen sizes."

---

### Closing (15 seconds)
**[Face camera or show full dashboard]**

"This demonstrates:
- Full CRUD operations
- Enforced state transitions
- AI interpretation with validation
- Error handling
- Clean, professional UI

All requirements met with clean architecture. Thank you!"

---

## Recording Tips:

### For Video 1 (Code Walkthrough):
1. Use screen recording with zoom on code
2. Speak clearly and not too fast
3. Highlight important code sections
4. Keep it under 4 minutes if possible
5. Consider using OBS Studio or Loom

### For Video 2 (Live Demo):
1. Have backend and frontend running smoothly
2. Clear browser cache before recording
3. Use a clean browser profile (no extensions visible)
4. Test all commands before recording
5. Have a script on second monitor
6. Keep cursor movements smooth
7. Speak while performing actions

### Tools:
- **OBS Studio** (free, professional)
- **Loom** (easy, auto-upload)
- **Windows Game Bar** (Win + G)
- **QuickTime** (Mac)

### Video Specs:
- **Resolution**: 1080p (1920x1080)
- **Format**: MP4
- **Max Size**: 100 MB each
- **Duration**: 2-5 minutes each
- **Audio**: Clear voice, no background noise

---

## Quick Checklist Before Recording:

Video 1:
- [ ] Backend and frontend code clean
- [ ] README.md up to date
- [ ] VS Code zoomed appropriately
- [ ] Important files bookmarked
- [ ] Test run through the script

Video 2:
- [ ] Backend running without errors
- [ ] Frontend running without console errors
- [ ] Database has NO tasks (fresh start)
- [ ] Gemini API working
- [ ] Browser at 100% zoom
- [ ] Test all commands work
- [ ] Clear browser history/cache

Good luck! 🎥
