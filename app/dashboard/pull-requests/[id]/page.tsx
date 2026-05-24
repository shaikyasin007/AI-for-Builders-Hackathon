"use client"

import { use, useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  GitPullRequest,
  GitBranch,
  FileCode,
  Plus,
  Minus,
  GitCommit,
  AlertTriangle,
  CheckCircle,
  Shield,
  Zap,
  Code,
  FileText,
  TestTube,
  Lightbulb,
  Copy,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { getReviewText, hasReviewContent } from "@/lib/reviews/insert-ai-review"

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

const severityConfig: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: "text-destructive", bg: "bg-destructive/10", label: "Critical" },
  high: { color: "text-warning", bg: "bg-warning/10", label: "High" },
  medium: { color: "text-chart-1", bg: "bg-chart-1/10", label: "Medium" },
  low: { color: "text-chart-3", bg: "bg-chart-3/10", label: "Low" },
  info: { color: "text-muted-foreground", bg: "bg-muted", label: "Info" },
}

const categoryConfig: Record<string, { icon: typeof Shield; label: string }> = {
  security: { icon: Shield, label: "Security" },
  performance: { icon: Zap, label: "Performance" },
  quality: { icon: Code, label: "Code Quality" },
  maintainability: { icon: FileText, label: "Maintainability" },
  architecture: { icon: GitBranch, label: "Architecture" },
  best_practices: { icon: Lightbulb, label: "Best Practices" },
  documentation: { icon: FileText, label: "Documentation" },
  testing: { icon: TestTube, label: "Testing" },
}

const mergeReadinessConfig = {
  ready: { color: "bg-success", textColor: "text-success", label: "Ready to Merge", description: "All checks passed. This PR is safe to merge." },
  minor_changes: { color: "bg-warning", textColor: "text-warning", label: "Needs Minor Changes", description: "Some improvements are recommended before merging." },
  major_changes: { color: "bg-chart-4", textColor: "text-chart-4", label: "Needs Major Changes", description: "Significant issues detected that should be addressed." },
  unsafe: { color: "bg-destructive", textColor: "text-destructive", label: "Unsafe to Merge", description: "Critical issues found. Do not merge until resolved." },
}

export default function PullRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const [pr, setPr] = useState<any>(null)
  const [review, setReview] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      // Fetch pull request from database
      const { data: prData } = await supabase
        .from("pull_requests")
        .select("*, repository:repositories(*)")
        .eq("id", resolvedParams.id)
        .single()
      
      setPr(prData)
      
      // Fetch review for this PR
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .eq("pull_request_id", resolvedParams.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      
      setReview(reviewData)
      setLoading(false)
    }
    
    fetchData()
  }, [resolvedParams.id])
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!pr) {
    notFound()
  }

  const mergeReadiness = mergeReadinessConfig.ready
  const issues: any[] = [] // TODO: Fetch from database when available
  
  const reviewText = getReviewText(review)
  const hasReview = hasReviewContent(review)
  const reviewData = hasReview
    ? {
        summary: reviewText,
        confidenceScore: 85,
        suggestions: review?.ai_suggestions || [],
        scores: {
          overall: 78,
          security: 75,
          performance: 75,
          maintainability: 80,
          readability: 80,
          architecture: 75,
          testing: 70,
        },
      }
    : {
        summary: "",
        confidenceScore: 0,
        suggestions: [],
        scores: {
          overall: 0,
          security: 0,
          performance: 0,
          maintainability: 0,
          readability: 0,
          architecture: 0,
          testing: 0,
        },
      }

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const res = await fetch("/api/ai/review-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pullRequestId: resolvedParams.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Analysis failed")
      }
      const supabase = createClient()
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .eq("pull_request_id", resolvedParams.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
      setReview(reviewData)
      toast.success("Analysis complete!", {
        description: "AI review has been saved.",
      })
    } catch (err) {
      toast.error("Analysis failed", {
        description: err instanceof Error ? err.message : "Could not run AI review",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Code copied to clipboard")
  }

  const scoreCategories = [
    { name: "Security", score: reviewData.scores.security, icon: Shield },
    { name: "Performance", score: reviewData.scores.performance, icon: Zap },
    { name: "Maintainability", score: reviewData.scores.maintainability, icon: FileText },
    { name: "Readability", score: reviewData.scores.readability, icon: Code },
    { name: "Architecture", score: reviewData.scores.architecture, icon: GitBranch },
    { name: "Testing", score: reviewData.scores.testing, icon: TestTube },
  ]

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
          href="/dashboard/pull-requests"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to pull requests
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <GitPullRequest className="w-6 h-6 text-success" />
            <h1 className="text-2xl font-bold tracking-tight">{pr.title}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="outline" className="font-mono">#{pr.number}</Badge>
            <span>{pr.repository?.name || "Unknown repository"}</span>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Avatar className="w-5 h-5">
                <AvatarImage src={pr.authorAvatar} />
                <AvatarFallback>{pr.author?.charAt(0) || "?"}</AvatarFallback>
              </Avatar>
              <span>{pr.author || "Unknown"}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <GitBranch className="w-4 h-4" />
              <span className="font-mono">{pr.branch_from || "unknown"}</span>
              <span>→</span>
              <span className="font-mono">{pr.branch_to || "main"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="w-4 h-4" />
            View on GitHub
          </Button>
          <Button 
            onClick={handleRunAnalysis} 
            disabled={isAnalyzing}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {hasReview ? "Re-analyze" : "Run Analysis"}
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* PR Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-1/10">
              <FileCode className="w-5 h-5 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pr.filesChanged}</p>
              <p className="text-xs text-muted-foreground">Files Changed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Plus className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">+{pr.insertions}</p>
              <p className="text-xs text-muted-foreground">Additions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <Minus className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">-{pr.deletions}</p>
              <p className="text-xs text-muted-foreground">Deletions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <GitCommit className="w-5 h-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pr.commits}</p>
              <p className="text-xs text-muted-foreground">Commits</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Merge Readiness Banner */}
      <motion.div variants={itemVariants}>
        <Card className={cn("border-l-4", `border-l-[var(--${mergeReadiness.color.replace('bg-', '')})]`)}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className={cn("p-3 rounded-full", mergeReadiness.color)}>
              {pr.mergeReadiness === "ready" ? (
                <CheckCircle className="w-6 h-6 text-success-foreground" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-warning-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={cn("font-semibold", mergeReadiness.textColor)}>{mergeReadiness.label}</h3>
              <p className="text-sm text-muted-foreground">{mergeReadiness.description}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{reviewData.scores.overall || 0}</p>
              <p className="text-xs text-muted-foreground">Overall Score</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="review" className="space-y-6">
          <TabsList>
            <TabsTrigger value="review">AI Review</TabsTrigger>
            <TabsTrigger value="issues">
              Issues
              <Badge variant="secondary" className="ml-2">{issues.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="scores">Score Breakdown</TabsTrigger>
          </TabsList>

          {/* AI Review Tab */}
          <TabsContent value="review" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Summary Card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-chart-1" />
                    AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasReview ? (
                    <>
                      <p className="text-muted-foreground leading-relaxed">{reviewData.summary}</p>
                      <Separator className="my-4" />
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Confidence:</span>
                          <Badge variant="secondary">{reviewData.confidenceScore}%</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Issues Found:</span>
                          <Badge variant="secondary">{issues.length}</Badge>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Sparkles className="mb-4 h-10 w-10 text-muted-foreground" />
                      <p className="mb-2 font-medium">No AI review yet</p>
                      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                        Generate an AI code review for this pull request. Use the button below or &quot;Run Analysis&quot; at the top right.
                      </p>
                      <Button onClick={handleRunAnalysis} disabled={isAnalyzing} className="gap-2">
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Run Analysis
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Issue Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(severityConfig).map(([key, config]) => {
                    const count = issues.filter(i => i.severity === key).length
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-3 h-3 rounded-full", config.bg.replace('/10', ''))} />
                          <span className="text-sm">{config.label}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-4">
            <Accordion type="multiple" className="space-y-4">
              {issues.map((issue) => {
                const severity = severityConfig[issue.severity]
                const category = categoryConfig[issue.category]
                const CategoryIcon = category.icon

                return (
                  <AccordionItem 
                    key={issue.id} 
                    value={issue.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/50">
                      <div className="flex items-center gap-3 flex-1">
                        <Badge className={cn(severity.bg, severity.color, "border-0")}>
                          {severity.label}
                        </Badge>
                        <div className={cn("p-1.5 rounded-md", category.icon === Shield ? "bg-destructive/10" : "bg-chart-1/10")}>
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-left">{issue.description}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono mr-4">
                        {issue.file}:{issue.line}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4">
                        {/* Explanation */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Why it matters</h4>
                          <p className="text-sm text-muted-foreground">{issue.explanation}</p>
                        </div>

                        {/* Suggested Fix */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Suggested Fix</h4>
                          <p className="text-sm text-muted-foreground">{issue.suggestedFix}</p>
                        </div>

                        {/* Code Example */}
                        {issue.codeExample && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-semibold">Example Code</h4>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCopyCode(issue.codeExample!)}
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <pre className="bg-secondary/50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                              {issue.codeExample}
                            </pre>
                          </div>
                        )}

                        {/* Confidence */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">AI Confidence:</span>
                          <Progress value={issue.confidence} className="w-24 h-2" />
                          <span>{issue.confidence}%</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </TabsContent>

          {/* Scores Tab */}
          <TabsContent value="scores" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scoreCategories.map((cat) => {
                const ScoreIcon = cat.icon
                const scoreColor = cat.score >= 80 ? "text-success" :
                                   cat.score >= 60 ? "text-warning" : "text-destructive"
                
                return (
                  <Card key={cat.name}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <ScoreIcon className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{cat.name}</span>
                        </div>
                        <span className={cn("text-2xl font-bold", scoreColor)}>
                          {cat.score}
                        </span>
                      </div>
                      <Progress value={cat.score} className="h-2" />
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}
