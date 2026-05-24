"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, CheckCheck, Filter, Settings, Trash2, GitPullRequest, Shield, Zap, Users, AlertTriangle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const notifications = [
  {
    id: "1",
    type: "review",
    title: "AI Review Completed",
    description: "Pull request #234 in frontend-app has been reviewed with 3 suggestions",
    time: "5 minutes ago",
    read: false,
    priority: "high",
  },
  {
    id: "2",
    type: "security",
    title: "Security Alert",
    description: "Critical vulnerability detected in api-gateway dependency lodash@4.17.15",
    time: "15 minutes ago",
    read: false,
    priority: "critical",
  },
  {
    id: "3",
    type: "performance",
    title: "Performance Regression",
    description: "Build time increased by 25% in mobile-app repository",
    time: "1 hour ago",
    read: false,
    priority: "medium",
  },
  {
    id: "4",
    type: "team",
    title: "New Team Member",
    description: "Sarah Chen has joined the Frontend Team",
    time: "2 hours ago",
    read: true,
    priority: "low",
  },
  {
    id: "5",
    type: "review",
    title: "Review Request",
    description: "You have been requested to review PR #456 in backend-services",
    time: "3 hours ago",
    read: true,
    priority: "medium",
  },
  {
    id: "6",
    type: "info",
    title: "Weekly Report Ready",
    description: "Your team's weekly code quality report is now available",
    time: "1 day ago",
    read: true,
    priority: "low",
  },
]

const typeIcons: Record<string, React.ReactNode> = {
  review: <GitPullRequest className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  performance: <Zap className="h-4 w-4" />,
  team: <Users className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
}

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-muted text-muted-foreground border-border",
}

export default function NotificationsPage() {
  const [items, setItems] = useState(notifications)
  const [filter, setFilter] = useState("all")

  const unreadCount = items.filter((n) => !n.read).length

  const filteredItems = items.filter((item) => {
    if (filter === "all") return true
    if (filter === "unread") return !item.read
    return item.type === filter
  })

  const markAsRead = (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your code reviews and team activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="gap-1">
          <Bell className="h-3 w-3" />
          {unreadCount} unread
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setFilter("all")}>All notifications</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("unread")}>Unread only</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("review")}>Reviews</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("security")}>Security</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("performance")}>Performance</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>
            {filteredItems.length} notification{filteredItems.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AnimatePresence mode="popLayout">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-lg font-medium">No notifications</p>
                <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
              </div>
            ) : (
              filteredItems.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "flex items-start gap-4 border-b p-4 last:border-0 transition-colors",
                    !notification.read && "bg-primary/5"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      priorityColors[notification.priority]
                    )}
                  >
                    {typeIcons[notification.type]}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className={cn("font-medium", !notification.read && "text-foreground")}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
