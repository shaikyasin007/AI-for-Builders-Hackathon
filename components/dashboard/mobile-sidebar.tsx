"use client"

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
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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

interface MobileSidebarProps {
  open: boolean
  onClose: () => void
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-screen w-72 bg-sidebar border-r border-sidebar-border z-50 lg:hidden flex flex-col"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
              <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">CodeGuardian</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              {sidebarLinks.map((group) => (
                <div key={group.title} className="mb-6">
                  <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.links.map((link) => {
                      const isActive = pathname === link.href
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="mobileActiveIndicator"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                            />
                          )}
                          <link.icon className={cn(
                            "w-5 h-5 flex-shrink-0 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span>{link.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
