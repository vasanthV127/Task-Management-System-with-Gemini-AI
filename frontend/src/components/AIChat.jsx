import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { aiAPI } from '../services/api';

export default function AIChat({ onTasksChange }) {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: '👋 Hi! I can help you manage tasks with natural language. Try saying:\n• "Add a task to prepare presentation"\n• "Start working on presentation"\n• "Show all completed tasks"'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await aiAPI.processCommand(userMessage);
      const data = response.data;

      setMessages(prev => [...prev, {
        type: 'ai',
        text: data.message,
        success: data.success,
        data: data.data
      }]);

      // Refresh tasks if action was successful
      if (data.success && ['CREATE', 'UPDATE_STATE', 'DELETE', 'UPDATE_DETAILS'].includes(data.action)) {
        onTasksChange();
      }

    } catch (err) {
      setMessages(prev => [...prev, {
        type: 'ai',
        text: err.response?.data?.detail || 'Failed to process command',
        success: false
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-2xl flex flex-col h-[500px] border border-gray-800">
      <div className="bg-gradient-to-r from-white to-gray-200 text-black p-4 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Bot size={24} />
          <div>
            <h2 className="font-bold">AI Assistant</h2>
            <p className="text-xs opacity-75">Powered by Gemini</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.type === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-black" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                msg.type === 'user'
                  ? 'bg-white text-black shadow-md'
                  : msg.success === false
                  ? 'bg-red-900/30 text-red-300 border border-red-600'
                  : msg.success === true
                  ? 'bg-green-900/30 text-green-300 border border-green-600'
                  : 'bg-gray-800 text-gray-200 border border-gray-700'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{msg.text}</p>
              
              {msg.data?.tasks && (
                <div className="mt-2 space-y-1">
                  {msg.data.tasks.map(task => (
                    <div key={task.id} className="text-xs bg-black bg-opacity-50 rounded p-2 border border-gray-700">
                      <strong>{task.title}</strong> - {task.state}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.type === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 border border-gray-700">
                <User size={18} className="text-white" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <Bot size={18} className="text-black" />
            </div>
            <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-800 p-4 bg-black">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-md"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
