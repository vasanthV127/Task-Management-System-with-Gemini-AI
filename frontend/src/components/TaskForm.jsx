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
        className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add New Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-4 border border-gray-200">
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title *"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-500"
          required
          autoFocus
        />
      </div>

      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows="3"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none placeholder-gray-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-black text-white py-2.5 rounded-lg font-bold hover:bg-gray-800 transition-all"
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
          className="px-5 py-2.5 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
