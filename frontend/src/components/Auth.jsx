import { useState } from 'react';
import { authAPI } from '../services/api';
import { LogIn, UserPlus, Brain } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await authAPI.login(username, password);
        localStorage.setItem('token', response.data.access_token);
        onLogin();
      } else {
        await authAPI.register(username, email, password);
        const response = await authAPI.login(username, password);
        localStorage.setItem('token', response.data.access_token);
        onLogin();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-black rounded-lg mb-4">
            <Brain className="text-white" size={48} />
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">
            Task Manager AI
          </h1>
          <p className="text-gray-600">Powered by Gemini • Intelligent Task Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition placeholder-gray-500"
              required
              placeholder="Enter your username"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition placeholder-gray-500"
                required
                placeholder="your@email.com"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition placeholder-gray-500"
              required
              minLength={6}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-gray-600 hover:text-black text-sm transition font-medium"
          >{isLogin ? "Don't have an account? Create one" : 'Already registered? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
