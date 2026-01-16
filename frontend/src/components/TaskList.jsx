import TaskCard from './TaskCard';
import { Filter } from 'lucide-react';

const STATES = ['All', 'Not Started', 'In Progress', 'Completed'];

export default function TaskList({ tasks, onUpdate, onDelete, filter, onFilterChange }) {
  const filteredTasks = filter === 'All' 
    ? tasks 
    : tasks.filter(task => task.state === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          Your Tasks ({filteredTasks.length})
        </h2>
        
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="px-3 py-2 bg-black border border-gray-700 text-white rounded-lg text-sm focus:ring-2 focus:ring-white focus:border-transparent"
          >
            {STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg shadow-xl p-8 text-center border border-gray-800">
          <p className="text-gray-400">
            {filter === 'All' 
              ? 'No tasks yet. Create one to get started!' 
              : `No tasks in "${filter}" state.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
