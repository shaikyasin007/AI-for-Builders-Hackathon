"use client"

import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { ActivityLog } from "@/lib/types"

interface ActivityChartProps {
  data: ActivityLog[]
}

export function ActivityChart({ data }: ActivityChartProps) {
  // Transform activity log data into chart format
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })

    const grouped = last7Days.map(date => {
      const dayActivities = data.filter(a => 
        a.created_at.split('T')[0] === date
      )
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        reviews: dayActivities.filter(a => a.action === 'review').length,
        issues: dayActivities.filter(a => a.action === 'issue' || a.action === 'security').length,
      }
    })

    // If no real data, show placeholder data
    if (data.length === 0) {
      return last7Days.map((_, i) => ({
        date: new Date(last7Days[i]).toLocaleDateString('en-US', { weekday: 'short' }),
        reviews: 0,
        issues: 0,
      }))
    }

    return grouped
  }, [data])

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fill: 'var(--muted-foreground)' }}
            tickLine={{ stroke: 'var(--border)' }}
            axisLine={{ stroke: 'var(--border)' }}
          />
          <YAxis 
            className="text-xs"
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
            labelStyle={{ color: 'var(--foreground)' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Area
            type="monotone"
            dataKey="reviews"
            name="Reviews"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorReviews)"
          />
          <Area
            type="monotone"
            dataKey="issues"
            name="Issues"
            stroke="var(--chart-2)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorIssues)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
