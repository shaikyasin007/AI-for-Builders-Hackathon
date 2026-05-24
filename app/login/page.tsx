"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/auth/auth-layout"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { getAuthErrorMessage } from "@/lib/auth/errors"

const DEMO_EMAIL = "demo@codeguardian.app"
const DEMO_PASSWORD = "HackathonDemo2026!"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const signIn = async (loginEmail: string, loginPassword: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (error) {
        toast.error("Login failed", { description: error.message })
        return
      }

      toast.success("Welcome back!", {
        description: "You have been successfully logged in.",
      })
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      toast.error("Login failed", { description: getAuthErrorMessage(err) })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn(email, password)
  }

  const handleDemoLogin = async () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    await signIn(DEMO_EMAIL, DEMO_PASSWORD)
  }



  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2 text-center lg:text-left">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>



        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 h-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
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
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        </form>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12"
          disabled={isLoading}
          onClick={handleDemoLogin}
        >
          Use hackathon demo account
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Demo: {DEMO_EMAIL} / {DEMO_PASSWORD}
        </p>

        <p className="text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
