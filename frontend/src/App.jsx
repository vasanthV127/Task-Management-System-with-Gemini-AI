import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import AIChat from './components/AIChat';
import TaskStats from './components/TaskStats';
import { tasksAPI, authAPI } from './services/api';
import { LogOut, Brain } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
        setIsAuthenticated(true);
        loadTasks();
      } catch (err) {
        localStorage.removeItem('token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getAllTasks();
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    checkAuth();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    setTasks([]);
  };

  const handleCreateTask = async (title, description) => {
    try {
      await tasksAPI.createTask(title, description);
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (id, data) => {
    try {
      await tasksAPI.updateTask(id, data);
      loadTasks();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksAPI.deleteTask(id);
        loadTasks();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete task');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl border border-gray-200">
          <div className="flex items-center gap-3 text-black">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <span className="text-lg font-medium">Loading your workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black rounded-lg">
                <Brain className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">Task Manager AI</h1>
                <p className="text-sm text-gray-600">Powered by Gemini • Intelligent Task Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hidden md:block">
                <p className="text-sm font-medium text-black">{user?.username}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all font-medium"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Tasks */}
          <div className="space-y-6">
            <TaskStats tasks={tasks} />
            <TaskForm onSubmit={handleCreateTask} />
            <TaskList
              tasks={tasks}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              filter={filter}
              onFilterChange={setFilter}
            />
          </div>

          {/* Right Side - AI Chat */}
          <div className="lg:sticky lg:top-24 h-fit">
            <AIChat onTasksChange={loadTasks} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
