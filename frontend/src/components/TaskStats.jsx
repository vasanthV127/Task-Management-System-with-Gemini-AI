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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all">
        <p className="text-gray-600 text-sm font-medium mb-1">Total Tasks</p>
        <p className="text-4xl font-bold text-black">{stats.total}</p>
      </div>
      
      <div className="bg-white p-5 rounded-lg border border-gray-300 shadow-md hover:shadow-lg transition-all">
        <p className="text-gray-600 text-sm font-medium mb-1">Not Started</p>
        <p className="text-4xl font-bold text-gray-700">{stats.notStarted}</p>
      </div>
      
      <div className="bg-white p-5 rounded-lg border border-gray-400 shadow-md hover:shadow-lg transition-all">
        <p className="text-gray-600 text-sm font-medium mb-1">In Progress</p>
        <p className="text-4xl font-bold text-gray-800">{stats.inProgress}</p>
      </div>
      
      <div className="bg-white p-5 rounded-lg border border-black shadow-md hover:shadow-lg transition-all">
        <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
        <p className="text-4xl font-bold text-black">{stats.completed}</p>
      </div>
      
      {stats.total > 0 && (
        <div className="col-span-2 md:col-span-4 bg-white p-5 rounded-lg border border-gray-200 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <p className="text-gray-600 text-sm font-medium">Completion Rate</p>
            <p className="text-black font-bold text-xl">{completionRate}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-black h-4 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
