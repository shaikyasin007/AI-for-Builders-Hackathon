"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Clock,
  Star,
  GitPullRequest,
  Award,
  Plus,
  Mail,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { TeamActivityChart } from "@/components/dashboard/charts/team-activity-chart"
import type { TeamMember, Profile, ActivityLog } from "@/lib/types"
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

interface TeamContentProps {
  teamMembers: (TeamMember & { profile?: Profile })[]
  activityLog: ActivityLog[]
  userId: string
}

export function TeamContent({ teamMembers, activityLog }: TeamContentProps) {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [isInviting, setIsInviting] = useState(false)

  const totalReviews = teamMembers.reduce((sum, m) => sum + m.reviews_completed, 0)
  const avgCommits = teamMembers.length > 0 
    ? Math.round(teamMembers.reduce((sum, m) => sum + m.commits_count, 0) / teamMembers.length)
    : 0

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsInviting(true)
    try {
      // In a real application, this would send an invitation email
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success("Invitation sent!", {
        description: `Invitation sent to ${inviteEmail}. They can now join your team.`
      })
      
      setInviteEmail("")
      setInviteDialogOpen(false)
    } catch (error) {
      toast.error("Failed to send invitation", {
        description: "Please try again later"
      })
    } finally {
      setIsInviting(false)
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
          <h1 className="text-3xl font-bold tracking-tight">Team Analytics</h1>
          <p className="text-muted-foreground">
            Track team performance and code review metrics
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to add a new team member to your workspace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isInviting}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isInviting) {
                      handleInviteMember()
                    }
                  }}
                />
              </div>
              <Button 
                onClick={handleInviteMember} 
                disabled={isInviting || !inviteEmail.trim()}
                className="w-full"
              >
                {isInviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isInviting ? "Sending..." : "Send Invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-chart-1/10">
                <Users className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
                <p className="text-xs text-muted-foreground">Team Members</p>
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
                <p className="text-2xl font-bold">{totalReviews}</p>
                <p className="text-xs text-muted-foreground">Total Reviews</p>
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
                <p className="text-2xl font-bold text-success">{avgCommits}</p>
                <p className="text-xs text-muted-foreground">Avg Commits</p>
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
                <p className="text-2xl font-bold">2.5h</p>
                <p className="text-xs text-muted-foreground">Avg Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {teamMembers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-chart-1/10 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-chart-1" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Team Members Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Invite team members to start tracking performance metrics and collaboration.
            </p>
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to add a new team member to your workspace
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-empty">Email Address</Label>
                    <Input
                      id="email-empty"
                      type="email"
                      placeholder="member@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={isInviting}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !isInviting) {
                          handleInviteMember()
                        }
                      }}
                    />
                  </div>
                  <Button 
                    onClick={handleInviteMember} 
                    disabled={isInviting || !inviteEmail.trim()}
                    className="w-full"
                  >
                    {isInviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isInviting ? "Sending..." : "Send Invitation"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Activity Chart */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Team Activity</CardTitle>
                <CardDescription>Reviews and issues over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamActivityChart data={activityLog} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Team Members */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Individual contributor metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {teamMembers.map((member, index) => (
                    <div 
                      key={member.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {member.profile?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning flex items-center justify-center">
                            <Award className="w-3 h-3 text-warning-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{member.profile?.full_name || "Unknown User"}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.reviews_completed} reviews completed
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-8 text-center">
                        <div>
                          <p className="text-xl font-bold">{member.reviews_completed}</p>
                          <p className="text-xs text-muted-foreground">Reviews</p>
                        </div>
                        <div>
                          <p className="text-xl font-bold">{member.commits_count}</p>
                          <p className="text-xs text-muted-foreground">Commits</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Monthly Leaderboard</CardTitle>
                <CardDescription>Top contributors by reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...teamMembers].sort((a, b) => b.reviews_completed - a.reviews_completed).map((member, index) => {
                    const maxReviews = Math.max(...teamMembers.map(m => m.reviews_completed), 1)
                    const percentage = (member.reviews_completed / maxReviews) * 100
                    
                    return (
                      <div key={member.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                              index === 0 ? "bg-warning text-warning-foreground" :
                              index === 1 ? "bg-muted-foreground/20 text-muted-foreground" :
                              index === 2 ? "bg-chart-4/20 text-chart-4" : "bg-secondary"
                            )}>
                              {index + 1}
                            </span>
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {member.profile?.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">
                              {member.profile?.full_name || "Unknown User"}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {member.reviews_completed} reviews
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
