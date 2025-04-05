// components/ui/learning-time-chart.tsx
"use client"

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"
import { useEffect, useState } from "react"

// Example data structure (will be replaced with real data)
const mockData = [
  { date: "2025-04-01", time: 0.2 },
  { date: "2025-04-02", time: 0.5 },
  { date: "2025-04-03", time: 1.2 },
  { date: "2025-04-04", time: 0.8 },
  { date: "2025-04-05", time: 0.3 },
  { date: "2025-04-06", time: 0.1 },
  { date: "2025-04-07", time: 0.6 },
]

const formatTime = (time: number) => {
  const hours = Math.floor(time)
  const minutes = Math.round((time - hours) * 60)
  return `${hours}h ${minutes}m`
}

interface LearningTimeChartProps {
  userId?: string;
  roadmapId?: string;
}

export function LearningTimeChart({ userId, roadmapId }: LearningTimeChartProps) {
  const [timeData, setTimeData] = useState(mockData)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    if (!userId) return
    
    const fetchLearningTimeData = async () => {
      setIsLoading(true)
      try {
        // Build the API URL with optional roadmapId filter
        let apiUrl = `/api/weeklyProgressTime?userId=${userId}`
        if (roadmapId) {
          apiUrl += `&roadmapId=${roadmapId}`
        }
        
        // Fetch time data from API
        const response = await fetch(apiUrl)
        if (!response.ok) throw new Error('Failed to fetch time data')
        
        const data = await response.json()
        
        // Process the data to get the last 7 days
        const last7DaysData = processTimeData(data)
        setTimeData(last7DaysData)
      } catch (error) {
        console.error('Error fetching learning time data:', error)
        // Fall back to mock data if there's an error
        setTimeData(mockData)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLearningTimeData()
  }, [userId, roadmapId])
  
  // Process the time data to get the last 7 days and convert seconds to hours
  const processTimeData = (data: Array<{ date: string, time: number }>) => {
    // Get the last 7 days
    const today = new Date()
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()
    
    // Create a map of dates to total time
    const timeByDate = new Map<string, number>()
    
    // Initialize with all days set to 0
    last7Days.forEach(date => {
      timeByDate.set(date, 0)
    })
    
    // Sum up the time for each date
    data.forEach(entry => {
      if (timeByDate.has(entry.date)) {
        timeByDate.set(entry.date, (timeByDate.get(entry.date) || 0) + entry.time)
      }
    })
    
    // Convert seconds to hours and create the final data array
    return last7Days.map(date => ({
      date,
      time: Number((timeByDate.get(date) || 0) / 3600).toFixed(2) // Convert seconds to hours
    })).map(item => ({
      date: item.date,
      time: parseFloat(item.time)
    }))
  }

  return (
    <div className="h-[300px] w-full">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-gray-400">Loading time data...</div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={timeData}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              stroke="#888"
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
            />
            <YAxis stroke="#888" tickFormatter={formatTime} />
            <Tooltip
              contentStyle={{ backgroundColor: "#222", border: "none" }}
              formatter={(value: number) => [formatTime(value), "Time"]}
              labelFormatter={(label) =>
                new Date(label as string).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
              }
            />
            <Line
              type="monotone"
              dataKey="time"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6" }}
              activeDot={{ r: 6, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}