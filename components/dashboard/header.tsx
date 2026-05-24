"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Command,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

interface HeaderProps {
  onMenuClick?: () => void
  user?: User
  profile?: Profile | null
}

export function Header({ onMenuClick, user, profile }: HeaderProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [showSearch, setShowSearch] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
  const displayEmail = user?.email || ''

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success("Logged out successfully")
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories, pull requests..."
              className="pl-10 pr-12 h-10 bg-secondary/50 border-transparent focus:border-primary"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-xs text-muted-foreground">
                <Command className="w-3 h-3" />K
              </kbd>
            </div>
          </div>
        </div>

        {/* Mobile search toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setShowSearch(!showSearch)}
        >
          {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
        </Button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative"
          >
            <Sun className="w-5 h-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-5 h-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Badge variant="secondary">0 new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <span className="text-sm text-muted-foreground">No new notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="justify-center">
                <Link href="/dashboard/notifications" className="text-primary">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{displayEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden px-4 pb-4 bg-background border-b border-border"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 h-10"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
