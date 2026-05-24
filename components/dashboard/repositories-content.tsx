"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  GitFork,
  Search,
  Plus,
  Star,
  GitBranch,
  Lock,
  Globe,
  MoreHorizontal,
  ArrowUpRight,
  Filter,
  Loader2,
  Github,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { Repository } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"
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

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-500",
  Python: "bg-green-500",
  Go: "bg-cyan-500",
  Rust: "bg-orange-500",
  Swift: "bg-red-500",
}

interface RepositoriesContentProps {
  repositories: Repository[]
  userId: string
}

export function RepositoriesContent({ repositories, userId }: RepositoriesContentProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [languageFilter, setLanguageFilter] = useState("all")
  const [isAddingRepo, setIsAddingRepo] = useState(false)
  const [newRepo, setNewRepo] = useState({ name: "", fullName: "", description: "", language: "TypeScript", isPrivate: false })
  const [repoUrl, setRepoUrl] = useState("")
  const [isImportingUrl, setIsImportingUrl] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [repoToDelete, setRepoToDelete] = useState<Repository | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredRepos = repositories.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = languageFilter === "all" || repo.language === languageFilter
    return matchesSearch && matchesLanguage
  })

  const languages = [...new Set(repositories.map(r => r.language).filter((l): l is string => Boolean(l)))]
  const avgHealthScore = repositories.length > 0 
    ? Math.round(repositories.reduce((acc, r) => acc + (r.health_score || 75), 0) / repositories.length)
    : 0

  const handleAddRepository = async () => {
    if (!newRepo.name || !newRepo.fullName) {
      toast.error("Please fill in repository name and full name")
      return
    }

    setIsAddingRepo(true)
    
    // Parse owner/repo from full_name
    const [owner, repo] = newRepo.fullName.split('/')
    
    try {
      const response = await fetch("/api/github/add-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRepo.name,
          url: `https://github.com/${newRepo.fullName}`,
          description: newRepo.description,
          language: newRepo.language,
          owner: owner || newRepo.name,
          repo: repo || newRepo.name,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error("Failed to add repository", { description: error.error || "Try again later" })
        setIsAddingRepo(false)
        return
      }

      toast.success("Repository added successfully!")
      setNewRepo({ name: "", fullName: "", description: "", language: "TypeScript", isPrivate: false })
      setDialogOpen(false)
      // Refresh after a delay to allow background fetch to complete
      setTimeout(() => router.refresh(), 2000)
    } catch (error) {
      console.error("[v0] Manual add error:", error)
      toast.error("Failed to add repository")
    } finally {
      setIsAddingRepo(false)
    }
  }

  const handleImportFromUrl = async () => {
    if (!repoUrl.trim()) {
      toast.error("Please enter a repository URL")
      return
    }

    setIsImportingUrl(true)
    try {
      const urlPattern = /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/
      const match = repoUrl.trim().match(urlPattern)

      if (!match) {
        toast.error("Invalid GitHub repository URL", {
          description: "Use format: https://github.com/owner/repo"
        })
        setIsImportingUrl(false)
        return
      }

      const owner = match[1]
      const repo = match[2]

      // Fetch repository data
      const fetchResponse = await fetch("/api/github/fetch-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo })
      })

      if (!fetchResponse.ok) {
        const error = await fetchResponse.json()
        toast.error("Repository not found", {
          description: error.error || "Please check the repository URL and try again"
        })
        setIsImportingUrl(false)
        return
      }

      const repoData = await fetchResponse.json()

      // Add repository to database
      const addResponse = await fetch("/api/github/add-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: repoData.data.name,
          url: repoData.data.url,
          description: repoData.data.description,
          language: repoData.data.language,
          owner,
          repo
        })
      })

      if (!addResponse.ok) {
        const error = await addResponse.json()
        toast.error("Failed to add repository", {
          description: error.error || "Try again later"
        })
        setIsImportingUrl(false)
        return
      }

      toast.success("Repository imported successfully!", {
        description: `${repoData.data.name} has been added to your dashboard`
      })

      setRepoUrl("")
      setDialogOpen(false)
      
      // Reload to show new repository
      setTimeout(() => router.refresh(), 3000)
    } catch (error) {
      console.error("[v0] Manual import error:", error)
      toast.error("Failed to import repository")
    } finally {
      setIsImportingUrl(false)
    }
  }

  const handleDeleteRepository = async () => {
    if (!repoToDelete) return

    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("repositories")
        .delete()
        .eq("id", repoToDelete.id)
        .eq("user_id", userId)

      if (error) {
        toast.error("Failed to delete repository", { description: error.message })
      } else {
        toast.success("Repository deleted successfully")
        setDeleteDialogOpen(false)
        setRepoToDelete(null)
        router.refresh()
      }
    } catch (error) {
      console.error("[v0] Delete error:", error)
      toast.error("Failed to delete repository")
    } finally {
      setIsDeleting(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            Manage and monitor your connected repositories
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Repository
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Repository</DialogTitle>
              <DialogDescription>
                Connect a new repository to start tracking code reviews.
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="github" className="gap-1">
                  <Github className="w-4 h-4" />
                  GitHub URL
                </TabsTrigger>
              </TabsList>

              {/* Manual Entry Tab */}
              <TabsContent value="manual" className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Repository Name</Label>
                  <Input
                    id="name"
                    placeholder="my-awesome-project"
                    value={newRepo.name}
                    onChange={(e) => setNewRepo({ ...newRepo, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name (owner/repo)</Label>
                  <Input
                    id="fullName"
                    placeholder="acme-corp/my-awesome-project"
                    value={newRepo.fullName}
                    onChange={(e) => setNewRepo({ ...newRepo, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="A brief description..."
                    value={newRepo.description}
                    onChange={(e) => setNewRepo({ ...newRepo, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Primary Language</Label>
                  <Select value={newRepo.language} onValueChange={(v) => setNewRepo({ ...newRepo, language: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Go">Go</SelectItem>
                      <SelectItem value="Rust">Rust</SelectItem>
                      <SelectItem value="Swift">Swift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddRepository} disabled={isAddingRepo}>
                    {isAddingRepo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Add Repository
                  </Button>
                </DialogFooter>
              </TabsContent>

              {/* GitHub URL Tab */}
              <TabsContent value="github" className="space-y-4 py-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Only public repositories can be imported this way
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Label htmlFor="repo-url">Repository URL</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/owner/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    disabled={isImportingUrl}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: https://github.com/vercel/next.js
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleImportFromUrl} disabled={isImportingUrl || !repoUrl.trim()}>
                    {isImportingUrl && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                    {isImportingUrl ? "Importing..." : "Import from GitHub"}
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map(lang => (
              <SelectItem key={lang} value={lang}>{lang}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-1/10">
                <GitFork className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{repositories.length}</p>
                <p className="text-xs text-muted-foreground">Total Repositories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Star className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgHealthScore}</p>
                <p className="text-xs text-muted-foreground">Avg Health Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-2/10">
                <GitBranch className="w-5 h-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">Open Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Lock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {repositories.filter(r => r.is_private).length}
                </p>
                <p className="text-xs text-muted-foreground">Private Repos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Repository List */}
      {filteredRepos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <GitFork className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {repositories.length === 0 ? "No repositories yet" : "No repositories found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {repositories.length === 0 
                ? "Add your first repository to get started"
                : "Try adjusting your search or filters"}
            </p>
            {repositories.length === 0 ? (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Repository
              </Button>
            ) : (
              <Button variant="outline" onClick={() => {
                setSearchQuery("")
                setLanguageFilter("all")
              }}>
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={itemVariants} className="grid gap-4">
          {filteredRepos.map((repo) => (
            <motion.div key={repo.id} variants={itemVariants}>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Repo Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <GitFork className="w-5 h-5 text-muted-foreground" />
                        <Link 
                          href={`/dashboard/repositories/${repo.id}`}
                          className="text-lg font-semibold hover:text-primary transition-colors truncate"
                        >
                          {repo.name}
                        </Link>
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
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                        {repo.description || "No description"}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {repo.language && (
                          <div className="flex items-center gap-1.5">
                            <span className={cn("w-3 h-3 rounded-full", languageColors[repo.language] || "bg-gray-500")} />
                            <span>{repo.language}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Health Score & Actions */}
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={cn(
                            "text-2xl font-bold",
                            repo.health_score >= 80 ? "text-success" :
                            repo.health_score >= 60 ? "text-warning" : "text-destructive"
                          )}>
                            {repo.health_score}
                          </p>
                          <span className="text-sm text-muted-foreground">/100</span>
                        </div>
                        <Progress 
                          value={repo.health_score} 
                          className="w-24 h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Health Score</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/repositories/${repo.id}`}>
                            View Details
                            <ArrowUpRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Run Full Scan</DropdownMenuItem>
                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                            <DropdownMenuItem>Configure Rules</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setRepoToDelete(repo)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              Delete Repository
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Repository</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{repoToDelete?.name || "this repository"}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteRepository}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Repository"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
