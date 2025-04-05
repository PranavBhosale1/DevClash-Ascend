"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

function SignInForm() {
  const { user, signInWithEmail, signInWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Check for error parameter in URL
  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'auth_callback_error') {
      toast.error('Authentication failed. Please try again.')
    }
  }, [searchParams])

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await signInWithEmail(formData.email, formData.password)
      toast.success("Signed in successfully!")
      // auth context will handle state change and redirection
    } catch (error: any) {
      console.error("Error signing in:", error)
      toast.error(error.message || "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
      // Google sign-in will redirect, no need for router.push here
    } catch (error: any) {
      console.error("Error signing in with Google:", error)
      toast.error(error.message || "Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-md"
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="space-y-1">
          <motion.h2
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Welcome back
          </motion.h2>
          <motion.p
            className="text-muted-foreground"
            variants={itemVariants}
          >
            Sign in to your account to continue
          </motion.p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              className="space-y-2"
              variants={itemVariants}
            >
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email" 
                placeholder="name@example.com"
                className="bg-background/50 backdrop-blur-sm border-border/50"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </motion.div>
            <motion.div
              className="space-y-2"
              variants={itemVariants}
            >
              <label className="text-sm font-medium">Password</label>
              <Input 
                type="password"
                className="bg-background/50 backdrop-blur-sm border-border/50"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Button 
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </motion.div>
          </form>

          <motion.div
            className="relative"
            variants={itemVariants}
          >
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              {isLoading ? "Signing in..." : "Sign in with Google"}
            </Button>
          </motion.div>

          <motion.div
            className="text-center space-y-4"
            variants={itemVariants}
          >
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function SignInPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Ascend Flow
          </motion.h1>
          <motion.nav
            className="ml-auto flex gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link href="/register" className="text-sm font-medium hover:text-primary transition-colors">
              Register
            </Link>
          </motion.nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <SignInForm />
        </Suspense>
      </main>
    </div>
  )
} 