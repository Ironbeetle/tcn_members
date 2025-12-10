'use client'
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { 
  sanitizeInput, 
  isValidUsername, 
  containsSuspiciousPatterns,
  checkRateLimit,
  recordLoginAttempt
} from "@/lib/security"

type LoginFormData = {
  username: string
  password: string
  honeypot?: string  // Honeypot field to catch bots
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [isLockedOut, setIsLockedOut] = useState(false)
  const [lockoutMinutes, setLockoutMinutes] = useState(0)
  const { login } = useAuth()
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()

  // Check rate limit on mount and periodically
  useEffect(() => {
    const checkLockout = () => {
      const { allowed, lockoutRemaining } = checkRateLimit()
      setIsLockedOut(!allowed)
      setLockoutMinutes(lockoutRemaining)
    }
    
    checkLockout()
    const interval = setInterval(checkLockout, 10000) // Check every 10 seconds
    
    return () => clearInterval(interval)
  }, [])

  const onSubmit = async (data: LoginFormData) => {
    // Check honeypot - if filled, it's likely a bot
    if (data.honeypot) {
      // Silently fail for bots
      setError("Login failed. Please try again.")
      return
    }

    // Check rate limit
    const { allowed, lockoutRemaining } = checkRateLimit()
    if (!allowed) {
      setIsLockedOut(true)
      setLockoutMinutes(lockoutRemaining)
      setError(`Too many failed attempts. Please try again in ${lockoutRemaining} minutes.`)
      return
    }

    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(data.username)
    const password = data.password // Don't sanitize password as it may contain special chars
    
    // Validate username format
    if (!isValidUsername(sanitizedUsername)) {
      setError("Invalid username format. Use only letters, numbers, and underscores.")
      recordLoginAttempt(false)
      return
    }

    // Check for suspicious patterns
    if (containsSuspiciousPatterns(data.username)) {
      setError("Invalid input detected.")
      recordLoginAttempt(false)
      return
    }

    // Password length check
    if (password.length < 8 || password.length > 128) {
      setError("Invalid password format.")
      recordLoginAttempt(false)
      return
    }

    setIsLoading(true)
    setError("")
    
    try {
      await login(sanitizedUsername, password)
      
      // Record successful attempt (resets counter)
      recordLoginAttempt(true)
      
      // Check activation status and redirect accordingly
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      
      if (session?.user?.activated === 'PENDING' || session?.user?.activated === 'NONE') {
        router.push('/Account_Activate')
      } else {
        router.push('/TCN_Home')
      }
    } catch (err) {
      // Record failed attempt
      recordLoginAttempt(false)
      
      // Check if now locked out
      const { allowed, lockoutRemaining } = checkRateLimit()
      if (!allowed) {
        setIsLockedOut(true)
        setLockoutMinutes(lockoutRemaining)
        setError(`Too many failed attempts. Please try again in ${lockoutRemaining} minutes.`)
      } else {
        setError(err instanceof Error ? err.message : "Login failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Member Login</CardTitle>
        <CardDescription>Enter your credentials to access the member portal</CardDescription>
      </CardHeader>
      <CardContent>
        {isLockedOut ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 font-medium">Account Temporarily Locked</p>
            <p className="text-sm text-red-500 mt-1">
              Too many failed login attempts. Please try again in {lockoutMinutes} minute{lockoutMinutes !== 1 ? 's' : ''}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Honeypot field - hidden from users, bots will fill it */}
            <input
              type="text"
              {...register("honeypot")}
              style={{ 
                position: 'absolute', 
                left: '-9999px',
                opacity: 0,
                height: 0,
                width: 0,
              }}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <input
                id="username"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                {...register("username", { 
                  required: "Username is required",
                  minLength: { value: 3, message: "Username must be at least 3 characters" },
                  maxLength: { value: 30, message: "Username is too long" },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Username can only contain letters, numbers, and underscores"
                  }
                })}
                disabled={isLoading}
                autoComplete="username"
                maxLength={30}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                  maxLength: { value: 128, message: "Password is too long" }
                })}
                disabled={isLoading}
                autoComplete="current-password"
                maxLength={128}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-amber-700 hover:bg-amber-800"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>

            <div className="text-center">
              <a 
                href="/forgot-password" 
                className="text-sm text-amber-700 hover:text-amber-800 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}