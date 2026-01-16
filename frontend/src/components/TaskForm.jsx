import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function TaskForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title, description);
      setTitle('');
      setDescription('');
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2 shadow-lg"
      >
        <Plus size={20} />
        Add New Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-xl p-5 space-y-3 border border-gray-800">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title *"
          className="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent placeholder-gray-500"
          required
          autoFocus
        />
      </div>

      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows="2"
          className="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent resize-none placeholder-gray-500"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-white text-black py-2 rounded-lg font-bold hover:bg-gray-200 transition shadow-md"
        >
          Create Task
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setTitle('');
            setDescription('');
          }}
          className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
