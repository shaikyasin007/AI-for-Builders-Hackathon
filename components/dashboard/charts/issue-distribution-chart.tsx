"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

// Default placeholder data - will be replaced with real data when passed
const defaultData = [
  { name: "Critical", value: 0, color: "#EF4444" },
  { name: "High", value: 0, color: "#F59E0B" },
  { name: "Medium", value: 0, color: "#3B82F6" },
  { name: "Low", value: 0, color: "#10B981" },
]

export function IssueDistributionChart() {
  const hasData = defaultData.some(item => item.value > 0)
  
  // Show placeholder if no data
  const displayData = hasData ? defaultData : [
    { name: "Critical", value: 1, color: "#EF4444" },
    { name: "High", value: 2, color: "#F59E0B" },
    { name: "Medium", value: 4, color: "#3B82F6" },
    { name: "Low", value: 3, color: "#10B981" },
  ]

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`${value} issues`, '']}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
