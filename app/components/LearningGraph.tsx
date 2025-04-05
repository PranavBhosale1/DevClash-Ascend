import React from 'react';
import { CircularProgress } from './CircularProgress';
import { ActivityHeatmap } from './ActivityHeatmap';

interface ProgressStats {
  totalSolved: number;
  totalProblems: number;
  easy: { solved: number, total: number };
  medium: { solved: number, total: number };
  hard: { solved: number, total: number };
}

export interface ActivityData {
  submissions: number;
  activeDays: number;
  maxStreak: number;
  dailyActivity: Array<{
    date: string;
    count: number;
    timeSpent: number;
  }>;
}

export function LearningGraph({ activityData }: { activityData: ActivityData | null }) {
  if (!activityData || !Array.isArray(activityData.dailyActivity)) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  // Mock data for progress stats - replace with actual data later
  const progressStats: ProgressStats = {
    totalSolved: 103,
    totalProblems: 427,
    easy: { solved: 77, total: 165 },
    medium: { solved: 18, total: 112 },
    hard: { solved: 8, total: 147 }
  };

  const categories = [
    { name: 'Beginner Problems', progress: 57 },
    { name: 'Sorting', progress: 100 },
    { name: 'Arrays', progress: 93 },
    { name: 'Hashing', progress: 25 },
    { name: 'Binary Search', progress: 57 },
    { name: 'Recursion', progress: 29 }
  ];

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Learning Progress</h3>
        <div className="space-y-4">
          {activityData.dailyActivity.map((day, index) => (
            <div key={day.date}>
              <div className="flex justify-between items-center">
                <span>{day.date}</span>
                <span>{day.count} submissions</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(day.count / Math.max(...activityData.dailyActivity.map(d => d.count))) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg p-6">
        <CircularProgress stats={progressStats} />
      </div>
      
      <div className="lg:col-span-2 bg-gray-900 rounded-lg p-6">
        <ActivityHeatmap data={activityData} />
      </div>
    </div>
  );
} 