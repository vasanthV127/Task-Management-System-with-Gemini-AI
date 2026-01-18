import TaskCard from './TaskCard';
import { Filter } from 'lucide-react';

const STATES = ['All', 'Not Started', 'In Progress', 'Completed'];

export default function TaskList({ tasks, onUpdate, onDelete, filter, onFilterChange }) {
  const filteredTasks = filter === 'All' 
    ? tasks 
    : tasks.filter(task => task.state === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">
          Your Tasks ({filteredTasks.length})
        </h2>
        
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
          <Filter size={18} className="text-gray-700" />
          <select
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            className="bg-transparent text-black text-sm focus:outline-none font-medium cursor-pointer"
          >
            {STATES.map(state => (
              <option key={state} value={state} className="bg-white">{state}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center border border-gray-200">
          <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
            <Filter size={32} className="text-gray-600" />
          </div>
          <p className="text-gray-600 text-lg">
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
