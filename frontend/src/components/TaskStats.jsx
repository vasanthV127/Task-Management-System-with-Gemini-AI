import { useState } from 'react';
import { X } from 'lucide-react';

export default function TaskStats({ tasks }) {
  const stats = {
    total: tasks.length,
    notStarted: tasks.filter(t => t.state === 'Not Started').length,
    inProgress: tasks.filter(t => t.state === 'In Progress').length,
    completed: tasks.filter(t => t.state === 'Completed').length,
  };

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-gray-900 to-black p-4 rounded-lg border border-gray-800 shadow-lg">
        <p className="text-gray-400 text-sm">Total Tasks</p>
        <p className="text-3xl font-bold text-white">{stats.total}</p>
      </div>
      
      <div className="bg-gradient-to-br from-gray-900 to-black p-4 rounded-lg border border-gray-600 shadow-lg">
        <p className="text-gray-400 text-sm">Not Started</p>
        <p className="text-3xl font-bold text-gray-300">{stats.notStarted}</p>
      </div>
      
      <div className="bg-gradient-to-br from-blue-900/30 to-black p-4 rounded-lg border border-blue-600 shadow-lg">
        <p className="text-blue-400 text-sm">In Progress</p>
        <p className="text-3xl font-bold text-blue-300">{stats.inProgress}</p>
      </div>
      
      <div className="bg-gradient-to-br from-green-900/30 to-black p-4 rounded-lg border border-green-600 shadow-lg">
        <p className="text-green-400 text-sm">Completed</p>
        <p className="text-3xl font-bold text-green-300">{stats.completed}</p>
      </div>
      
      {stats.total > 0 && (
        <div className="col-span-2 md:col-span-4 bg-gradient-to-br from-gray-900 to-black p-4 rounded-lg border border-gray-800 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-400 text-sm">Completion Rate</p>
            <p className="text-white font-bold">{completionRate}%</p>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-white to-gray-300 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
