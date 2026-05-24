"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { week: "Week 1", issues: 45 },
  { week: "Week 2", issues: 52 },
  { week: "Week 3", issues: 38 },
  { week: "Week 4", issues: 42 },
  { week: "Week 5", issues: 35 },
  { week: "Week 6", issues: 28 },
]

export function PerformanceTrendsChart() {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="week" 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickLine={{ stroke: 'var(--border)' }}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickLine={{ stroke: 'var(--border)' }}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value} issues`, 'Performance Issues']}
          />
          <Line
            type="monotone"
            dataKey="issues"
            stroke="var(--warning)"
            strokeWidth={2}
            dot={{ fill: 'var(--warning)', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'var(--warning)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
