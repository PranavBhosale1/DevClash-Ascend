"use client";

import { ResponsiveContainer } from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tooltip } from "react-tooltip";

// Add custom CSS to override default styles
const customStyles = `
  .react-calendar-heatmap .color-scale-1 { fill: #E6E1F9; } /* Very light purple for low activity */
  .react-calendar-heatmap .color-scale-2 { fill: #C3B5F6; } /* Light purple */
  .react-calendar-heatmap .color-scale-3 { fill: #9C7CF2; } /* Medium purple */
  .react-calendar-heatmap .color-scale-4 { fill: #6B3EEF; } /* Dark purple for high activity */
  .react-calendar-heatmap .color-empty { fill: #1a1a1a; } /* Dark background for no activity */

  /* Add hover effects */
  .react-calendar-heatmap rect:hover {
    stroke: #8B5CF6;
    stroke-width: 1px;
    transition: all 0.2s ease-in-out;
  }
`;

interface HeatmapProps {
  data: { date: string; value: number }[];
  colors?: string[];
  tooltipFormatter?: (value: number) => string;
  className?: string;
}

const getColorClass = (value: number) => {
  if (value === 0) return 'color-empty';
  if (value < 1800) return 'color-scale-1';
  if (value < 3600) return 'color-scale-2';
  if (value < 7200) return 'color-scale-3';
  return 'color-scale-4';
};

// 🗓️ Generate all dates for the past year
const getHeatmapData = (data: { date: string; value: number }[]) => {
  const today = new Date();
  const startDate = new Date();
  startDate.setFullYear(today.getFullYear() - 1);

  const dateMap = new Map(data.map((entry) => [entry.date, entry.value]));

  const allDates = [];
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    allDates.push({ date: dateStr, value: dateMap.get(dateStr) || 0 });
  }
  return allDates;
};

export function Heatmap({ data, tooltipFormatter, className }: HeatmapProps) {
  return (
    <>
      <style>{customStyles}</style>
      <ResponsiveContainer width="100%" height={200}>
        <div>
          <CalendarHeatmap
            startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
            endDate={new Date()}
            values={getHeatmapData(data)}
            showWeekdayLabels
            gutterSize={4}
            classForValue={(value: { date: string; value: number } | null) => {
              if (!value) return 'color-empty';
              return getColorClass(value.value);
            }}
            tooltipDataAttrs={(value: { date: string; value: number }) => ({
              "data-tooltip-id": "heatmap-tooltip",
              "data-tooltip-content": tooltipFormatter
                ? tooltipFormatter(value.value)
                : `${Math.floor(value.value / 60)} min`,
            })}
            style={{
              background: "black",
              padding: "10px",
              borderRadius: "8px",
            }}
          />
          <Tooltip id="heatmap-tooltip" />
        </div>
      </ResponsiveContainer>
    </>
  );
}
