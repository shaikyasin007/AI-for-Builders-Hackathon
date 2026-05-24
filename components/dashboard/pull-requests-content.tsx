"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  GitPullRequest,
  Search,
  GitMerge,
  GitPullRequestClosed,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { PullRequest, Repository } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
import { insertAIReview } from "@/lib/reviews/insert-ai-review"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const statusConfig = {
  open: { icon: GitPullRequest, color: "text-success", bg: "bg-success/10", label: "Open" },
  merged: { icon: GitMerge, color: "text-chart-2", bg: "bg-chart-2/10", label: "Merged" },
  closed: { icon: GitPullRequestClosed, color: "text-muted-foreground", bg: "bg-muted", label: "Closed" },
}

const priorityConfig = {
  critical: { color: "bg-destructive text-destructive-foreground", label: "Critical" },
  high: { color: "bg-warning text-warning-foreground", label: "High" },
  medium: { color: "bg-chart-1 text-chart-1-foreground", label: "Medium" },
  low: { color: "bg-success text-success-foreground", label: "Low" },
}

interface PullRequestsContentProps {
  pullRequests: (PullRequest & { repository?: Repository })[]
  repositories: Pick<Repository, "id" | "name">[]
  userId: string
}

export function PullRequestsContent({ pullRequests, repositories, userId }: PullRequestsContentProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [repoFilter, setRepoFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isAddingPR, setIsAddingPR] = useState(false)
  const [newPR, setNewPR] = useState({
    title: "",
    description: "",
    repository_id: "",
    branch_from: "feature-branch",
    priority: "medium" as "critical" | "high" | "medium" | "low",
  })

  const filteredPRs = pullRequests.filter(pr => {
    const matchesSearch = pr.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || pr.status === statusFilter
    const matchesRepo = repoFilter === "all" || pr.repository_id === repoFilter
    return matchesSearch && matchesStatus && matchesRepo
  })

  const openPRs = pullRequests.filter(pr => pr.status === "open")
  const mergedPRs = pullRequests.filter(pr => pr.status === "merged")

  const handleAddPR = async () => {
    if (!newPR.title || !newPR.repository_id) {
      toast.error("Please fill in title and select a repository")
      return
    }

    setIsAddingPR(true)
    const supabase = createClient()

    const { data: prData, error } = await supabase.from("pull_requests").insert({
      user_id: userId,
      repository_id: newPR.repository_id,
      title: newPR.title,
      description: newPR.description,
      status: "open",
    }).select().single()

    if (error) {
      toast.error("Failed to create pull request", { description: error.message })
      setIsAddingPR(false)
      return
    }

    toast.success("Pull request created!")

    // Trigger AI analysis
    try {
      const aiResponse = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "code-review",
          repositoryId: newPR.repository_id,
          content: `Pull Request: ${newPR.title}\nDescription: ${newPR.description}\nBranch: ${newPR.branch_from}`,
        }),
      })

      if (aiResponse.ok) {
        const aiData = await aiResponse.json()
        
        const { error: reviewError } = await insertAIReview(supabase, {
          pull_request_id: prData.id,
          repository_id: newPR.repository_id,
          reviewer_id: userId,
          analysis: aiData.analysis || "AI analysis completed",
        })

        if (reviewError) {
          toast.error("Failed to save AI review", { description: reviewError.message })
        } else {
          toast.success("AI review completed!")
        }
      }
    } catch (aiError) {
      console.error("AI analysis error:", aiError)
      toast.warning("AI analysis failed, but PR was created")
    }

    setNewPR({ title: "", description: "", repository_id: "", branch_from: "feature-branch", priority: "medium" })
    setDialogOpen(false)
    router.refresh()
    setIsAddingPR(false)
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
          <h1 className="text-3xl font-bold tracking-tight">Pull Requests</h1>
          <p className="text-muted-foreground">
            Review and analyze pull requests across your repositories
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={repositories.length === 0}>
              <Plus className="w-4 h-4" />
              Create PR
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Pull Request</DialogTitle>
              <DialogDescription>
                Create a new pull request for review.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pr-title">Title</Label>
                <Input
                  id="pr-title"
                  placeholder="Add new feature..."
                  value={newPR.title}
                  onChange={(e) => setNewPR({ ...newPR, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pr-repo">Repository</Label>
                <Select value={newPR.repository_id} onValueChange={(v) => setNewPR({ ...newPR, repository_id: v })}>
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
              <div className="space-y-2">
                <Label htmlFor="pr-branch">Branch</Label>
                <Input
                  id="pr-branch"
                  placeholder="feature/my-feature"
                  value={newPR.branch_from}
                  onChange={(e) => setNewPR({ ...newPR, branch_from: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pr-priority">Priority</Label>
                <Select value={newPR.priority} onValueChange={(v: "critical" | "high" | "medium" | "low") => setNewPR({ ...newPR, priority: v })}>
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
                <Label htmlFor="pr-desc">Description</Label>
                <Textarea
                  id="pr-desc"
                  placeholder="Describe your changes..."
                  value={newPR.description}
                  onChange={(e) => setNewPR({ ...newPR, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddPR} disabled={isAddingPR}>
                {isAddingPR ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create PR
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
              <div className="p-2 rounded-lg bg-success/10">
                <GitPullRequest className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openPRs.length}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <GitMerge className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mergedPRs.length}</p>
                <p className="text-xs text-muted-foreground">Merged</p>
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
                <p className="text-2xl font-bold">{openPRs.filter(pr => pr.priority === "critical" || pr.priority === "high").length}</p>
                <p className="text-xs text-muted-foreground">High Priority</p>
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
                <p className="text-2xl font-bold">{openPRs.filter(pr => pr.priority === "critical").length}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search pull requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="merged">Merged</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={repoFilter} onValueChange={setRepoFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Repository" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Repositories</SelectItem>
            {repositories.map(repo => (
              <SelectItem key={repo.id} value={repo.id}>{repo.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* PR List */}
      {filteredPRs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <GitPullRequest className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {pullRequests.length === 0 ? "No pull requests yet" : "No pull requests found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {pullRequests.length === 0 
                ? repositories.length === 0 
                  ? "Add a repository first, then create pull requests"
                  : "Create your first pull request to get started"
                : "Try adjusting your search or filters"}
            </p>
            {pullRequests.length === 0 && repositories.length > 0 && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create PR
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          {filteredPRs.map((pr) => {
            const status = statusConfig[pr.status]
            const priority = priorityConfig[pr.priority]
            const StatusIcon = status.icon

            return (
              <motion.div key={pr.id} variants={itemVariants}>
                <Link href={`/dashboard/pull-requests/${pr.id}`}>
                  <Card className="hover:shadow-lg transition-all hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        {/* PR Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={cn("p-1.5 rounded-md", status.bg)}>
                              <StatusIcon className={cn("w-4 h-4", status.color)} />
                            </div>
                            <span className="text-lg font-semibold truncate">{pr.title}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            {pr.github_number && <span className="font-mono">#{pr.github_number}</span>}
                            <span>•</span>
                            <span>{pr.repository?.name || "Unknown repo"}</span>
                            {pr.branch_from && pr.branch_to && (
                              <>
                                <span>•</span>
                                <span>{pr.branch_from} → {pr.branch_to}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        {(pr.files_changed || pr.lines_added || pr.lines_removed) && (
                          <div className="flex items-center gap-6 text-sm">
                            {pr.files_changed && (
                              <div className="text-center">
                                <p className="font-semibold">{pr.files_changed}</p>
                                <p className="text-xs text-muted-foreground">Files</p>
                              </div>
                            )}
                            {pr.lines_added && (
                              <div className="text-center">
                                <p className="font-semibold text-success">+{pr.lines_added}</p>
                                <p className="text-xs text-muted-foreground">Additions</p>
                              </div>
                            )}
                            {pr.lines_removed && (
                              <div className="text-center">
                                <p className="font-semibold text-destructive">-{pr.lines_removed}</p>
                                <p className="text-xs text-muted-foreground">Deletions</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Status badges */}
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={cn("gap-1", status.bg, status.color)}>
                            {status.label}
                          </Badge>
                          {priority && (
                            <Badge className={priority.color}>
                              {priority.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
