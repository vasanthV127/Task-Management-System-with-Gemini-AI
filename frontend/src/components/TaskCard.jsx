import { Trash2, Edit2 } from 'lucide-react';

const STATE_COLORS = {
  'Not Started': 'bg-gray-800 text-gray-300 border-gray-600',
  'In Progress': 'bg-blue-900/30 text-blue-300 border-blue-600',
  'Completed': 'bg-green-900/30 text-green-300 border-green-600',
};

const STATE_ACTIONS = {
  'Not Started': 'In Progress',
  'In Progress': 'Completed',
  'Completed': null,
};

export default function TaskCard({ task, onUpdate, onDelete }) {
  const nextState = STATE_ACTIONS[task.state];

  const handleStateChange = () => {
    if (nextState) {
      onUpdate(task.id, { state: nextState });
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-xl p-5 hover:shadow-2xl transition border border-gray-800 hover:border-gray-700">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-white flex-1">
          {task.title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-400 hover:text-red-300 transition"
            title="Delete task"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-400 text-sm mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${STATE_COLORS[task.state]}`}>
          {task.state}
        </span>

        {nextState && (
          <button
            onClick={handleStateChange}
            className="text-sm bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200 transition font-medium shadow-md"
          >
            Move to {nextState}
          </button>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Created: {new Date(task.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}
