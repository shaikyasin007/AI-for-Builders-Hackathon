"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  { week: "Week 1", found: 15, resolved: 12 },
  { week: "Week 2", found: 23, resolved: 18 },
  { week: "Week 3", found: 18, resolved: 22 },
  { week: "Week 4", found: 12, resolved: 15 },
  { week: "Week 5", found: 8, resolved: 10 },
  { week: "Week 6", found: 5, resolved: 8 },
]

export function SecurityTrendsChart() {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
          />
          <Legend />
          <Bar dataKey="found" name="Found" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="resolved" name="Resolved" fill="var(--success)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
