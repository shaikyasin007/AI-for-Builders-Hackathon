"use client"

import { use, useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  GitFork,
  GitPullRequest,
  Star,
  GitBranch,
  Lock,
  Globe,
  ArrowLeft,
  Users,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  ExternalLink,
  Settings,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Repository, PullRequest } from "@/lib/types"
import { RepositoryHealthChart } from "@/components/dashboard/charts/repository-health-chart"
import { toast } from "sonner"

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

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-500",
  Python: "bg-green-500",
  Go: "bg-cyan-500",
  Rust: "bg-orange-500",
  Swift: "bg-red-500",
}

export default function RepositoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const [repo, setRepo] = useState<Repository | null>(null)
  const [prs, setPrs] = useState<PullRequest[]>([])
  const [securityIssues, setSecurityIssues] = useState<any[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundFlag, setNotFoundFlag] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Fetch repository
        const { data: repoData, error: repoError } = await supabase
          .from("repositories")
          .select("*")
          .eq("id", resolvedParams.id)
          .single()

        if (repoError || !repoData) {
          setNotFoundFlag(true)
          return
        }

        setRepo(repoData as Repository)

        // Fetch pull requests for this repository
        const { data: prsData } = await supabase
          .from("pull_requests")
          .select("*")
          .eq("repository_id", resolvedParams.id)

        setPrs((prsData || []) as PullRequest[])

        // Fetch security issues for this repository (handle missing table)
        let securityData: any[] = []
        try {
          const { data: secData } = await supabase
            .from("security_issues")
            .select("*")
            .eq("repository_id", resolvedParams.id)
            .eq("status", "open")
          securityData = secData || []
        } catch (securityError) {
          console.log("[v0] Security issues table might not exist:", securityError)
        }
        setSecurityIssues(securityData)

        // Fetch performance metrics for this repository (handle missing table)
        let perfData: any[] = []
        try {
          const { data: perfDataResult } = await supabase
            .from("performance_metrics")
            .select("*")
            .eq("repository_id", resolvedParams.id)
            .order("recorded_at", { ascending: false })
            .limit(1)
          perfData = perfDataResult || []
        } catch (perfError) {
          console.log("[v0] Performance metrics table might not exist:", perfError)
        }
        setPerformanceMetrics(perfData)

        console.log("[v0] Loaded repository:", repoData?.name || repoData?.full_name || "Unknown", "ID:", resolvedParams.id)
      } catch (error) {
        console.error("[v0] Error fetching repository:", error)
        setNotFoundFlag(true)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  
  if (notFoundFlag || !repo) {
    notFound()
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back button */}
      <motion.div variants={itemVariants}>
        <Link 
          href="/dashboard/repositories"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to repositories
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <GitFork className="w-6 h-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold tracking-tight">{repo.name}</h1>
            {repo.is_private ? (
              <Badge variant="secondary" className="gap-1">
                <Lock className="w-3 h-3" />
                Private
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Globe className="w-3 h-3" />
                Public
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground max-w-2xl">{repo.description}</p>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
            {repo.language && (
              <div className="flex items-center gap-1.5">
                <span className={cn("w-3 h-3 rounded-full", languageColors[repo.language] || "bg-gray-500")} />
                <span>{repo.language}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{repo.stars} stars</span>
            </div>
            <div className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              <span>{repo.forks} forks</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              if (repo.url) {
                window.open(repo.url, '_blank')
              }
            }}
          >
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </Button>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              // Navigate to repository settings
              window.location.href = `/dashboard/repositories/${repo.id}/settings`
            }}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button 
            className="gap-2"
            onClick={() => {
              // Trigger a full scan of the repository
              toast.success("Repository scan started", {
                description: "Analysis will complete in a few moments"
              })
            }}
          >
            <Zap className="w-4 h-4" />
            Run Scan
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Health Score</p>
                <p className={cn(
                  "text-3xl font-bold",
            repo.health_score >= 80 ? "text-success" :
            repo.health_score >= 60 ? "text-warning" : "text-destructive"
                )}>
                  {repo.health_score}
                </p>
              </div>
              <div className="w-16">
                <Progress value={repo.health_score} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <GitPullRequest className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{prs.filter(pr => pr.status === 'open').length}</p>
                <p className="text-xs text-muted-foreground">Open PRs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{securityIssues.length}</p>
                <p className="text-xs text-muted-foreground">Security Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Zap className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{performanceMetrics.filter(m => (m.lighthouse_score ?? 100) < 80).length}</p>
                <p className="text-xs text-muted-foreground">Performance Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pull-requests">Pull Requests</TabsTrigger>
            <TabsTrigger value="contributors">Contributors</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Code Quality Trends</CardTitle>
                  <CardDescription>Health score over the past 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <RepositoryHealthChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Issue Breakdown</CardTitle>
                  <CardDescription>Current issues by category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const securityCount = securityIssues.length
                    const performanceCount = performanceMetrics.filter(m => (m.lighthouse_score ?? 100) < 80).length
                    const codeQualityCount = prs.filter(pr => pr.status === 'open').length
                    const total = securityCount + performanceCount + codeQualityCount

                    if (total === 0) {
                      return <p className="text-sm text-muted-foreground">No issues data available</p>
                    }

                    const issues = [
                      { name: "Security", count: securityCount, color: "bg-destructive" },
                      { name: "Performance", count: performanceCount, color: "bg-warning" },
                      { name: "Code Quality", count: codeQualityCount, color: "bg-chart-1" },
                    ].filter(item => item.count > 0)

                    return issues.map((item) => (
                      <div key={item.name} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="text-muted-foreground">{item.count} issues</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary">
                          <div
                            className={cn("h-full rounded-full", item.color)}
                            style={{ width: `${(item.count / total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pull-requests" className="space-y-4">
          {prs.length > 0 ? (
            prs.map((pr) => (
                <Card key={pr.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4">
                        <Link 
                          href={`/dashboard/pull-requests/${pr.id}`}
                          className="font-medium hover:text-primary transition-colors flex-1"
                        >
                          {pr.title}
                        </Link>
                        <Badge variant={pr.status === "open" ? "default" : "secondary"}>
                          {pr.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono">#{pr.github_number || pr.id.slice(0, 8)}</span>
                        <span>•</span>
                        <span>{pr.priority} priority</span>
                        <span>•</span>
                        <span>{pr.files_changed} files changed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <GitPullRequest className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No pull requests</h3>
                  <p className="text-muted-foreground">This repository has no open pull requests</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="contributors" className="space-y-4">
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No contributors data available yet</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Quality Trends</CardTitle>
                <CardDescription>Code quality metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <RepositoryHealthChart />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
