"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Shield, Sparkles } from "lucide-react"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-background via-background-secondary to-background overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-chart-2/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-chart-3/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center glow">
                <Shield className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold">CodeGuardian AI</span>
            </Link>
            
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              AI-Powered Code Review
              <span className="block gradient-text">for Modern Teams</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
              Automatically detect bugs, security vulnerabilities, and performance issues 
              before they reach production.
            </p>
            
            <div className="space-y-4">
              {[
                'Security vulnerability detection',
                'Performance bottleneck analysis',
                'Code quality scoring',
                'Automated fix suggestions'
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Floating code snippets */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute bottom-24 right-12 glass rounded-xl p-4 max-w-xs animate-float"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-xs text-muted-foreground">Critical Issue</span>
          </div>
          <p className="text-sm font-mono text-foreground">SQL injection vulnerability in auth/handlers.ts:45</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute top-32 right-24 glass rounded-xl p-4 max-w-xs animate-float"
          style={{ animationDelay: '2s' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Code Quality</span>
          </div>
          <p className="text-sm font-mono text-foreground">Score: 87/100</p>
        </motion.div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
