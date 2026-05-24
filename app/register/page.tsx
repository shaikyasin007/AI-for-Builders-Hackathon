"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail, Eye, EyeOff, ArrowRight, Loader2, User, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AuthLayout } from "@/components/auth/auth-layout"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { getAuthErrorMessage } from "@/lib/auth/errors"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        toast.error("Registration failed", { description: error.message })
        return
      }

      toast.success("Account created!", {
        description: "You can sign in now (email confirmation should be off in Supabase).",
      })
      router.push("/login")
    } catch (err) {
      toast.error("Registration failed", { description: getAuthErrorMessage(err) })
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2 text-center lg:text-left">
          <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
        </div>



        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
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
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
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
            
            {/* Password requirements */}
            <div className="space-y-1 pt-1">
              {passwordRequirements.map((req) => (
                <div key={req.label} className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    req.met ? 'bg-success text-success-foreground' : 'bg-muted'
                  }`}>
                    {req.met && <Check className="w-3 h-3" />}
                  </div>
                  <span className={req.met ? 'text-success' : 'text-muted-foreground'}>
                    {req.label}
                  </span>
                </div>
              ))}
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
                  Create account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link href="#" className="underline hover:text-foreground">Terms of Service</Link>
          {" "}and{" "}
          <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
      </div>
    </AuthLayout>
  )
}
