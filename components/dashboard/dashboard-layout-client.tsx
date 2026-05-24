"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types"

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: User
  profile: Profile | null
}

export function DashboardLayoutClient({ children, user, profile }: DashboardLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar 
        open={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Main content */}
      <div className="lg:pl-[280px] transition-all duration-300">
        <Header 
          onMenuClick={() => setMobileMenuOpen(true)} 
          user={user}
          profile={profile}
        />
        <main className="p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
