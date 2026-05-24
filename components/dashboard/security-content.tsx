"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lock,
  Key,
  Database,
  Globe,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SecurityTrendsChart } from "@/components/dashboard/charts/security-trends-chart"
import type { SecurityIssue, Repository } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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

const vulnerabilityTypeIcons: Record<string, typeof Database> = {
  "SQL Injection": Database,
  "XSS Vulnerabilities": Globe,
  "Hardcoded Secrets": Key,
  "Insecure Authentication": Lock,
  "Unsafe API Calls": AlertCircle,
}

const severityColors: Record<string, string> = {
  critical: "bg-destructive text-destructive-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-chart-1 text-chart-1-foreground",
  low: "bg-success text-success-foreground",
}

interface SecurityContentProps {
  securityIssues: (SecurityIssue & { repository?: Repository })[]
  repositories: Repository[]
  userId: string
}

export function SecurityContent({ securityIssues, repositories, userId }: SecurityContentProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    repository_id: "",
    severity: "medium" as const,
    category: "Unsafe API Calls",
  })

  const metrics = {
    total: securityIssues.length,
    critical: securityIssues.filter(i => i.severity === "critical").length,
    high: securityIssues.filter(i => i.severity === "high").length,
    medium: securityIssues.filter(i => i.severity === "medium").length,
    low: securityIssues.filter(i => i.severity === "low").length,
    resolved: securityIssues.filter(i => i.status === "resolved").length,
    open: securityIssues.filter(i => i.status === "open").length,
  }

  // Group by category
  const byCategory = securityIssues.reduce((acc, issue) => {
    const cat = issue.category || "Other"
    if (!acc[cat]) acc[cat] = { count: 0, severity: issue.severity }
    acc[cat].count++
    return acc
  }, {} as Record<string, { count: number; severity: string }>)

  // Repository risk scores
  const repoRisks = repositories.map(repo => {
    const repoIssues = securityIssues.filter(i => i.repository_id === repo.id && i.status === "open")
    const riskScore = repoIssues.reduce((score, issue) => {
      if (issue.severity === "critical") return score + 10
      if (issue.severity === "high") return score + 5
      if (issue.severity === "medium") return score + 2
      return score + 1
    }, 0)
    return { ...repo, riskScore, vulnerabilities: repoIssues.length }
  }).sort((a, b) => b.riskScore - a.riskScore)

  const handleAddIssue = async () => {
    if (!newIssue.title || !newIssue.repository_id) {
      toast.error("Please fill in title and select a repository")
      return
    }

    setIsAdding(true)
    const supabase = createClient()
    
    const { error } = await supabase.from("security_issues").insert({
      repository_id: newIssue.repository_id,
      title: newIssue.title,
      description: newIssue.description,
      severity: newIssue.severity,
      category: newIssue.category,
      status: "open",
    })

    if (error) {
      toast.error("Failed to add security issue", { description: error.message })
    } else {
      toast.success("Security issue reported!")
      setNewIssue({ title: "", description: "", repository_id: "", severity: "medium", category: "Unsafe API Calls" })
      setDialogOpen(false)
      router.refresh()
    }
    setIsAdding(false)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Center</h1>
          <p className="text-muted-foreground">
            Monitor and address security vulnerabilities across your codebase
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={repositories.length === 0}>
              <Plus className="w-4 h-4" />
              Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Security Issue</DialogTitle>
              <DialogDescription>
                Report a new security vulnerability for review.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="SQL injection in login endpoint"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Repository</Label>
                <Select value={newIssue.repository_id} onValueChange={(v) => setNewIssue({ ...newIssue, repository_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {repositories.map(repo => (
                      <SelectItem key={repo.id} value={repo.id}>{repo.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={newIssue.severity} onValueChange={(v: "critical" | "high" | "medium" | "low") => setNewIssue({ ...newIssue, severity: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newIssue.category} onValueChange={(v) => setNewIssue({ ...newIssue, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SQL Injection">SQL Injection</SelectItem>
                      <SelectItem value="XSS Vulnerabilities">XSS</SelectItem>
                      <SelectItem value="Hardcoded Secrets">Hardcoded Secrets</SelectItem>
                      <SelectItem value="Insecure Authentication">Auth Issues</SelectItem>
                      <SelectItem value="Unsafe API Calls">Unsafe API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the vulnerability..."
                  value={newIssue.description}
                  onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddIssue} disabled={isAdding}>
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Report Issue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.total}</p>
                <p className="text-xs text-muted-foreground">Total Vulnerabilities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{metrics.critical}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
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
                <p className="text-2xl font-bold text-success">{metrics.resolved}</p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.open}</p>
                <p className="text-xs text-muted-foreground">Open Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {securityIssues.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Security Issues</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {repositories.length === 0 
                ? "Add repositories to start scanning for security vulnerabilities."
                : "Great! No security vulnerabilities have been detected. Keep up the good work!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Severity Distribution */}
          <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Severity Distribution</CardTitle>
                <CardDescription>Vulnerabilities by severity level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Critical", count: metrics.critical, color: "bg-destructive" },
                  { label: "High", count: metrics.high, color: "bg-warning" },
                  { label: "Medium", count: metrics.medium, color: "bg-chart-1" },
                  { label: "Low", count: metrics.low, color: "bg-success" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">{item.count} issues</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary">
                      <div 
                        className={cn("h-full rounded-full transition-all", item.color)}
                        style={{ width: metrics.total > 0 ? `${(item.count / metrics.total) * 100}%` : '0%' }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Trends</CardTitle>
                <CardDescription>Vulnerability count over time</CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityTrendsChart />
              </CardContent>
            </Card>
          </motion.div>

          {/* Vulnerability Types */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Types</CardTitle>
                <CardDescription>Most common security issues detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(byCategory).map(([category, data]) => {
                    const VulnIcon = vulnerabilityTypeIcons[category] || AlertCircle
                    return (
                      <div 
                        key={category}
                        className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-destructive/10">
                          <VulnIcon className="w-5 h-5 text-destructive" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{category}</p>
                          <p className="text-sm text-muted-foreground">{data.count} occurrences</p>
                        </div>
                        <Badge className={severityColors[data.severity]}>
                          {data.severity}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Repository Risk Scores */}
          {repoRisks.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <CardTitle>Repository Risk Scores</CardTitle>
                  <CardDescription>Repositories ranked by security risk</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {repoRisks.slice(0, 5).map((repo) => (
                      <div 
                        key={repo.id}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{repo.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {repo.vulnerabilities} vulnerabilities found
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={cn(
                              "text-xl font-bold",
                              repo.riskScore > 30 ? "text-destructive" :
                              repo.riskScore > 15 ? "text-warning" : "text-success"
                            )}>
                              {repo.riskScore}
                            </p>
                            <p className="text-xs text-muted-foreground">Risk Score</p>
                          </div>
                          <Progress 
                            value={Math.min(repo.riskScore, 50)} 
                            max={50}
                            className="w-20 h-2"
                          />
                        </div>
                      </div>
                    ))}
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
