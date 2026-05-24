"use client"

import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { ActivityLog } from "@/lib/types"

interface TeamActivityChartProps {
  data: ActivityLog[]
}

export function TeamActivityChart({ data }: TeamActivityChartProps) {
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
        commits: dayActivities.filter(a => a.action === 'commit').length,
        reviews: dayActivities.filter(a => a.action === 'review').length,
        prs: dayActivities.filter(a => a.action === 'pr' || a.action === 'pull_request').length,
      }
    })

    // If no real data, show placeholder data
    if (data.length === 0) {
      return last7Days.map((_, i) => ({
        date: new Date(last7Days[i]).toLocaleDateString('en-US', { weekday: 'short' }),
        commits: 0,
        reviews: 0,
        prs: 0,
      }))
    }

    return grouped
  }, [data])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPRs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="date" 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Area
          type="monotone"
          dataKey="commits"
          stroke="hsl(var(--chart-1))"
          fillOpacity={1}
          fill="url(#colorCommits)"
          name="Commits"
        />
        <Area
          type="monotone"
          dataKey="reviews"
          stroke="hsl(var(--chart-2))"
          fillOpacity={1}
          fill="url(#colorReviews)"
          name="Reviews"
        />
        <Area
          type="monotone"
          dataKey="prs"
          stroke="hsl(var(--chart-3))"
          fillOpacity={1}
          fill="url(#colorPRs)"
          name="PRs"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
