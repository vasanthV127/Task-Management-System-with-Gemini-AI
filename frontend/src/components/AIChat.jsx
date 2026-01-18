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
    <div className="bg-white rounded-lg shadow-xl flex flex-col h-[600px] border border-gray-200">
      <div className="bg-black text-white p-4 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg">AI Assistant</h2>
            <p className="text-xs text-gray-300">Powered by Gemini</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.type === 'ai' && (
              <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                <Bot size={20} className="text-white" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.type === 'user'
                  ? 'bg-black text-white'
                  : msg.success === false
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : msg.success === true
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-50 text-gray-800 border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
              
              {msg.data?.tasks && (
                <div className="mt-3 space-y-2">
                  {msg.data.tasks.map(task => (
                    <div key={task.id} className="text-xs bg-white rounded-lg p-2.5 border border-gray-200">
                      <strong className="text-black">{task.title}</strong> <span className="text-gray-600">- {task.state}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.type === 'user' && (
              <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-gray-700" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-lg bg-black flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3 bg-white border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
