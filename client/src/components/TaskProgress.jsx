import React from 'react';

const TaskProgress = ({ completed, total }) => {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
      <h3 className="text-lg font-semibold mb-2">Daily Progress</h3>
      <div className="flex justify-between text-sm mb-2 opacity-90">
        <span>{completed} of {total} tasks completed</span>
        <span className="font-bold">{percentage}%</span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-3">
        <div 
          className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {percentage === 100 && total > 0 && (
        <p className="mt-4 text-sm font-medium bg-white/20 inline-block px-3 py-1 rounded-lg">
          🎉 Awesome job! You've completed all tasks!
        </p>
      )}
    </div>
  );
};

export default TaskProgress;
