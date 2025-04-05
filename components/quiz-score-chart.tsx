"use client"

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts"

const data = [
  { quiz: "Physics Week 1", score: 85 },
  { quiz: "Physics Week 2", score: 70 },
  { quiz: "Physics Week 3", score: 90 },
  { quiz: "Math Week 1", score: 75 },
  { quiz: "Math Week 2", score: 80 },
  { quiz: "Chemistry Week 1", score: 65 },
]

export function QuizScoreChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="quiz" stroke="#888" angle={-45} textAnchor="end" height={60} />
          <YAxis stroke="#888" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: "#222", border: "none" }}
            formatter={(value: number) => [`${value}%`, "Score"]}
          />
          <Bar dataKey="score" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

