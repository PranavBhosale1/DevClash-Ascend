import React from 'react';
import { format, eachDayOfInterval, subYears, startOfWeek, addDays } from 'date-fns';

interface ActivityData {
  submissions: number;
  activeDays: number;
  maxStreak: number;
  dailyActivity: {
    date: string;
    count: number;
    timeSpent: number;
  }[];
}

interface ActivityHeatmapProps {
  data: ActivityData | null;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  if (!data || !data.dailyActivity) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const endDate = new Date();
  const startDate = subYears(endDate, 1);
  
  // Generate all dates for the past year
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Create a map of activity counts with safe access
  const activityMap = new Map(
    (data.dailyActivity || []).map(({ date, count }) => [date, count])
  );

  // Get max activity for color scaling with safe default
  const maxActivity = Math.max(1, ...(data.dailyActivity || []).map(d => d.count));
  
  // Generate weeks array for the grid
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  allDates.forEach((date) => {
    if (date.getDay() === 0 && currentWeek.length) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
  });
  if (currentWeek.length) weeks.push(currentWeek);

  // Function to get color based on activity level
  const getActivityColor = (count: number) => {
    if (count === 0) return 'bg-gray-800';
    const intensity = Math.min((count / maxActivity) * 4, 4);
    return `bg-green-${Math.round(intensity) * 200}`;
  };

  const weekDays = ['Mon', 'Wed', 'Fri'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg">
          <span className="font-bold">{data.submissions || 0}</span>
          <span className="text-gray-400 ml-2">submissions in the past one year</span>
        </div>
        <div className="text-gray-400">
          <span>Total active days: </span>
          <span className="font-bold text-white">{data.activeDays || 0}</span>
          <span className="ml-4">Max Streak: </span>
          <span className="font-bold text-white">{data.maxStreak || 0}</span>
        </div>
      </div>

      <div className="relative">
        {/* Month labels */}
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          {['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].map((month) => (
            <span key={month}>{month}</span>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col justify-between text-sm text-gray-400 mr-2 pt-2" style={{ height: '150px' }}>
            {weekDays.map(day => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* Activity grid */}
          <div className="flex-1 grid grid-flow-col gap-1" style={{ gridTemplateRows: 'repeat(7, 1fr)' }}>
            {weeks.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {week.map((date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const count = activityMap.get(dateStr) || 0;
                  return (
                    <div
                      key={dateStr}
                      className={`w-4 h-4 rounded-sm ${getActivityColor(count)}`}
                      title={`${dateStr}: ${count} submissions`}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end mt-4 text-sm text-gray-400">
          <span>Less</span>
          <div className="flex gap-1 mx-2">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-4 h-4 rounded-sm ${level === 0 ? 'bg-gray-800' : `bg-green-${level * 200}`}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
} 