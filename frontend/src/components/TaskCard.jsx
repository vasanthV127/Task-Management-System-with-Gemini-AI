import { Trash2, Edit2 } from 'lucide-react';

const STATE_COLORS = {
  'Not Started': 'bg-gray-100 text-gray-700 border-gray-300',
  'In Progress': 'bg-gray-800 text-white border-gray-600',
  'Completed': 'bg-black text-white border-black'
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
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-all border border-gray-200 hover:border-gray-400">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-black flex-1">
          {task.title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-600 hover:text-black transition-all p-2 hover:bg-gray-100 rounded-lg"
            title="Delete task"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">{task.description}</p>
      )}

      <div className="flex items-center justify-between gap-3">
        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${STATE_COLORS[task.state]}`}>
          {task.state}
        </span>

        {nextState && (
          <button
            onClick={handleStateChange}
            className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all font-medium"
          >
            Move to {nextState}
          </button>
        )}
      </div>

      <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
        <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
