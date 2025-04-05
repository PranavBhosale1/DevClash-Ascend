import React from 'react';

interface ProgressStats {
  totalSolved: number;
  totalProblems: number;
  easy: { solved: number; total: number };
  medium: { solved: number; total: number };
  hard: { solved: number; total: number };
}

interface CircularProgressProps {
  stats: ProgressStats;
}

export function CircularProgress({ stats }: CircularProgressProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const totalProgress = (stats.totalSolved / stats.totalProblems) * 100;
  
  // Calculate individual progress percentages
  const easyProgress = (stats.easy.solved / stats.easy.total) * 100;
  const mediumProgress = (stats.medium.solved / stats.medium.total) * 100;
  const hardProgress = (stats.hard.solved / stats.hard.total) * 100;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-48 h-48">
        {/* Background circle */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          className="stroke-gray-700"
          strokeWidth="12"
          fill="transparent"
        />
        
        {/* Hard problems (red) */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          className="stroke-red-500"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (hardProgress / 100) * circumference}
          fill="transparent"
          strokeLinecap="round"
        />
        
        {/* Medium problems (yellow) */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          className="stroke-yellow-500"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (mediumProgress / 100) * circumference}
          fill="transparent"
          strokeLinecap="round"
        />
        
        {/* Easy problems (green) */}
        <circle
          cx="96"
          cy="96"
          r={radius}
          className="stroke-green-500"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (easyProgress / 100) * circumference}
          fill="transparent"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{stats.totalSolved}</span>
        <span className="text-sm text-gray-400">/{stats.totalProblems}</span>
        <span className="text-sm text-gray-400 mt-1">Solved</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-0 flex gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span>Easy {stats.easy.solved}/{stats.easy.total}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span>Medium {stats.medium.solved}/{stats.medium.total}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span>Hard {stats.hard.solved}/{stats.hard.total}</span>
        </div>
      </div>
    </div>
  );
} 