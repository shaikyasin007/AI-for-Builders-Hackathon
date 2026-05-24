"use client"

import { motion } from "framer-motion"
import { 
  GitFork, 
  GitPullRequest, 
  Shield, 
  Zap, 
  Sparkles, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ActivityChart } from "@/components/dashboard/charts/activity-chart"
import { IssueDistributionChart } from "@/components/dashboard/charts/issue-distribution-chart"
import { cn } from "@/lib/utils"
import type { Repository, PullRequest, ActivityLog, TeamMember, Profile } from "@/lib/types"

interface DashboardMetrics {
  totalRepositories: number
  pullRequestsReviewed: number
  securityIssuesDetected: number
  performanceIssuesDetected: number
  aiReviewsGenerated: number
  avgCodeQualityScore: number
}

interface DashboardContentProps {
  metrics: DashboardMetrics
  repositories: Repository[]
  pullRequests: (PullRequest & { repository?: Repository })[]
  activityLog: ActivityLog[]
  teamMembers: (TeamMember & { profile?: Profile })[]
  profile: Profile | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const statusColors: Record<string, string> = {
  open: "bg-chart-2 text-chart-2-foreground",
  merged: "bg-success text-success-foreground",
  closed: "bg-muted text-muted-foreground",
}

export function DashboardContent({ 
  metrics, 
  repositories, 
  pullRequests, 
  activityLog, 
  teamMembers,
  profile
}: DashboardContentProps) {
  const metricItems = [
    {
      title: "Repositories",
      value: metrics.totalRepositories,
      change: "+2",
      trend: "up" as const,
      icon: GitFork,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10"
    },
    {
      title: "PRs Reviewed",
      value: metrics.pullRequestsReviewed,
      change: "+23",
      trend: "up" as const,
      icon: GitPullRequest,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10"
    },
    {
      title: "Security Issues",
      value: metrics.securityIssuesDetected,
      change: "-12",
      trend: "down" as const,
      icon: Shield,
      color: "text-destructive",
      bgColor: "bg-destructive/10"
    },
    {
      title: "Performance Issues",
      value: metrics.performanceIssuesDetected,
      change: "-8",
      trend: "down" as const,
      icon: Zap,
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      title: "AI Reviews",
      value: metrics.aiReviewsGenerated,
      change: "+156",
      trend: "up" as const,
      icon: Sparkles,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10"
    },
    {
      title: "Avg Quality Score",
      value: metrics.avgCodeQualityScore,
      suffix: "/100",
      change: "+5",
      trend: "up" as const,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10"
    }
  ]

  const hasData = repositories.length > 0 || pullRequests.length > 0

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Overview of your code review activity and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/repositories">View Repositories</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/pull-requests">Review PRs</Link>
          </Button>
        </div>
      </div>

      {/* Metrics grid */}
      <motion.div 
        variants={itemVariants}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        {metricItems.map((metric) => (
          <Card key={metric.title} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-lg", metric.bgColor)}>
                  <metric.icon className={cn("w-4 h-4", metric.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  metric.trend === "up" ? "text-success" : "text-destructive"
                )}>
                  {metric.trend === "up" ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {metric.change}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {metric.value.toLocaleString()}{metric.suffix}
                </p>
                <p className="text-xs text-muted-foreground">{metric.title}</p>
              </div>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Card>
        ))}
      </motion.div>

      {!hasData ? (
        <motion.div variants={itemVariants}>
          <Card className="border-dashed">
            <CardContent className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Started</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Add your first repository to start tracking code reviews, security issues, and team performance.
              </p>
              <Button asChild>
                <Link href="/dashboard/repositories">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Repository
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Charts row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Review Activity</CardTitle>
                  <CardDescription>Reviews and issues detected over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ActivityChart data={activityLog} />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Issue Distribution</CardTitle>
                  <CardDescription>Breakdown of detected issues by severity</CardDescription>
                </CardHeader>
                <CardContent>
                  <IssueDistributionChart />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent PRs and Repos */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Pull Requests */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Pull Requests</CardTitle>
                    <CardDescription>Latest reviewed pull requests</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/pull-requests">View all</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pullRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No pull requests yet
                    </p>
                  ) : (
                    pullRequests.slice(0, 4).map((pr) => (
                      <Link 
                        key={pr.id} 
                        href={`/dashboard/pull-requests/${pr.id}`}
                        className="block"
                      >
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                          <Avatar className="w-9 h-9">
                            <AvatarFallback>{pr.title.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium truncate">{pr.title}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>#{pr.github_number || "N/A"}</span>
                              <span>•</span>
                              <span>{pr.repository?.name || "Unknown"}</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className={cn("text-xs", statusColors[pr.status])}>
                            {pr.status}
                          </Badge>
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Repository Health */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Repository Health</CardTitle>
                    <CardDescription>Code quality scores across repositories</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/repositories">View all</Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {repositories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No repositories connected
                    </p>
                  ) : (
                    repositories.slice(0, 4).map((repo) => (
                      <Link 
                        key={repo.id} 
                        href={`/dashboard/repositories/${repo.id}`}
                        className="block"
                      >
                        <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <GitFork className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium truncate">{repo.name}</span>
                              {repo.is_private && (
                                <Badge variant="outline" className="text-xs">Private</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{repo.language || "Unknown"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={cn(
                                "text-lg font-semibold",
                                repo.health_score >= 80 ? "text-success" :
                                repo.health_score >= 60 ? "text-warning" : "text-destructive"
                              )}>
                                {repo.health_score}
                              </p>
                              <p className="text-xs text-muted-foreground">Health</p>
                            </div>
                            <Progress 
                              value={repo.health_score} 
                              className="w-16 h-2"
                            />
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Team Activity */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Activity</CardTitle>
                  <CardDescription>Review performance across team members</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/team">View details</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {teamMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No team members yet
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {teamMembers.map((member) => (
                      <div 
                        key={member.id}
                        className="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {member.profile?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.profile?.full_name || "Unknown User"}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{member.reviews_completed} reviews</span>
                            <span>•</span>
                            <span className="text-success">{member.commits_count} commits</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
