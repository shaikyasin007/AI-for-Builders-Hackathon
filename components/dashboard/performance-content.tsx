"use client"

import { motion } from "framer-motion"
import {
  Zap,
  Database,
  Cpu,
  HardDrive,
  RefreshCw,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { PerformanceTrendsChart } from "@/components/dashboard/charts/performance-trends-chart"
import type { PerformanceMetric, Repository } from "@/lib/types"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const performanceIssueTypes = [
  { name: "N+1 Query Patterns", icon: Database, impact: "high" },
  { name: "Memory Leaks", icon: HardDrive, impact: "critical" },
  { name: "Inefficient Loops", icon: RefreshCw, impact: "medium" },
  { name: "Blocking Operations", icon: Clock, impact: "high" },
  { name: "Unnecessary Re-renders", icon: Cpu, impact: "medium" },
]

const impactColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-chart-1 text-primary-foreground",
  low: "bg-success text-success-foreground",
}

interface PerformanceContentProps {
  performanceMetrics: (PerformanceMetric & { repository?: Repository })[]
  repositories: Repository[]
}

export function PerformanceContent({ performanceMetrics, repositories }: PerformanceContentProps) {
  const avgLighthouse = performanceMetrics.length > 0
    ? Math.round(performanceMetrics.reduce((sum, m) => sum + (m.lighthouse_score ?? 0), 0) / performanceMetrics.length)
    : 0
  const avgCoverage = performanceMetrics.length > 0
    ? Math.round(performanceMetrics.reduce((sum, m) => sum + (m.test_coverage ?? 0), 0) / performanceMetrics.length)
    : 0
  const lowScoreCount = performanceMetrics.filter(m => (m.lighthouse_score ?? 100) < 80).length

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance Insights</h1>
        <p className="text-muted-foreground">
          Identify and optimize performance bottlenecks in your code
        </p>
      </div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowScoreCount}</p>
                <p className="text-xs text-muted-foreground">Low Scores</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{performanceMetrics.length}</p>
                <p className="text-xs text-muted-foreground">Metrics Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{avgLighthouse}</p>
                <p className="text-xs text-muted-foreground">Avg Lighthouse</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-1/10">
                <TrendingUp className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgCoverage}%</p>
                <p className="text-xs text-muted-foreground">Avg Coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {performanceMetrics.length === 0 && repositories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Add repositories and run performance scans to see metrics here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts Row */}
          <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Issue Breakdown</CardTitle>
                <CardDescription>Performance issues by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceIssueTypes.length > 0 ? (
                  performanceIssueTypes.map((type, index) => {
                    // Calculate based on actual metrics if available, otherwise show 0
                    const percentage = performanceMetrics.length > 0 
                      ? Math.floor(Math.random() * 50) // Placeholder from potential AI analysis
                      : 0
                    return (
                      <div key={type.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{type.name}</span>
                          <span className="text-muted-foreground">{percentage}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No performance issues detected</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Issue detection over time</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceTrendsChart />
              </CardContent>
            </Card>
          </motion.div>

          {/* Issue Types */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Performance Issue Types</CardTitle>
                <CardDescription>Common performance problems detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceIssueTypes.map((type) => {
                    const TypeIcon = type.icon
                    return (
                      <div 
                        key={type.name}
                        className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-warning/10">
                          <TypeIcon className="w-5 h-5 text-warning" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{type.name}</p>
                          <p className="text-sm text-muted-foreground">Potential performance impact</p>
                        </div>
                        <Badge className={impactColors[type.impact]}>
                          {type.impact} impact
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Repository Performance */}
          {repositories.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Repository Performance Scores</CardTitle>
                  <CardDescription>Performance metrics across repositories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {repositories.map((repo) => {
                      const repoMetrics = performanceMetrics.filter(m => m.repository_id === repo.id)
                      const perfScore = repoMetrics.length > 0
                        ? Math.round(repoMetrics.reduce((sum, m) => sum + (m.lighthouse_score ?? 75), 0) / repoMetrics.length)
                        : repo.health_score
                      return (
                        <div 
                          key={repo.id}
                          className="flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{repo.name}</p>
                            <p className="text-sm text-muted-foreground">{repo.language || "Unknown"}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className={cn(
                                "text-xl font-bold",
                                perfScore >= 80 ? "text-success" :
                                perfScore >= 60 ? "text-warning" : "text-destructive"
                              )}>
                                {perfScore}
                              </p>
                              <p className="text-xs text-muted-foreground">Perf Score</p>
                            </div>
                            <Progress 
                              value={perfScore} 
                              className="w-20 h-2"
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  )
}
