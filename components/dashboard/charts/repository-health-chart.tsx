"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { day: "Mon", score: 82 },
  { day: "Tue", score: 85 },
  { day: "Wed", score: 78 },
  { day: "Thu", score: 88 },
  { day: "Fri", score: 91 },
  { day: "Sat", score: 87 },
  { day: "Sun", score: 89 },
]

export function RepositoryHealthChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="day" 
            tick={{ fill: 'var(--muted-foreground)' }}
            tickLine={{ stroke: 'var(--border)' }}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis 
            domain={[60, 100]}
            tick={{ fill: 'var(--muted-foreground)' }}
            tickLine={{ stroke: 'var(--border)' }}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value}%`, 'Health Score']}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--chart-1)"
            strokeWidth={2}
            dot={{ fill: 'var(--chart-1)', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'var(--chart-1)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
