"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  GitFork,
  GitPullRequest,
  Sparkles,
  Shield,
  Zap,
  Network,
  Users,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const sidebarLinks = [
  {
    title: "Overview",
    links: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/repositories", label: "Repositories", icon: GitFork },
      { href: "/dashboard/pull-requests", label: "Pull Requests", icon: GitPullRequest },
      { href: "/dashboard/reviews", label: "AI Reviews", icon: Sparkles },
    ]
  },
  {
    title: "Analysis",
    links: [
      { href: "/dashboard/security", label: "Security Center", icon: Shield },
      { href: "/dashboard/performance", label: "Performance", icon: Zap },
      { href: "/dashboard/architecture", label: "Architecture", icon: Network },
    ]
  },
  {
    title: "Team",
    links: [
      { href: "/dashboard/team", label: "Team Analytics", icon: Users },
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold text-lg whitespace-nowrap overflow-hidden"
                >
                  CodeGuardian
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sidebarLinks.map((group) => (
            <div key={group.title} className="mb-6">
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {group.title}
                  </motion.h3>
                )}
              </AnimatePresence>
              <div className="space-y-1">
                {group.links.map((link) => {
                  const isActive = pathname === link.href
                  const LinkContent = (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                        />
                      )}
                      <link.icon className={cn(
                        "w-5 h-5 flex-shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="whitespace-nowrap overflow-hidden"
                          >
                            {link.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  )

                  if (isCollapsed) {
                    return (
                      <Tooltip key={link.href}>
                        <TooltipTrigger asChild>
                          {LinkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="font-medium">
                          {link.label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return LinkContent
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-background border border-border shadow-sm"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>
      </motion.aside>
    </TooltipProvider>
  )
}
