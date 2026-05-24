"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/auth/auth-layout"
import { toast } from "sonner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitted(true)
    toast.success("Email sent!", {
      description: "Check your inbox for reset instructions."
    })
  }

  if (isSubmitted) {
    return (
      <AuthLayout>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-muted-foreground">
              {"We've sent password reset instructions to:"}
            </p>
            <p className="font-medium">{email}</p>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Try a different email
            </Button>
            
            <Link href="/login">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Button>
            </Link>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {"Didn't receive an email? Check your spam folder or "}
            <button
              onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
              className="text-primary hover:underline"
            >
              resend
            </button>
          </p>
        </motion.div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Reset password</h2>
          <p className="text-muted-foreground">
            {"Enter your email and we'll send you instructions to reset your password."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-hover hover:opacity-90 transition-opacity"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Send reset link
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
