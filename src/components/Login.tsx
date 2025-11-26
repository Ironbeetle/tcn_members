'use client'
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"

type LoginFormData = {
  username: string
  password: string
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const { login } = useAuth()
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError("")
    
    try {
      const result = await login(data.username, data.password)
      
      // Check activation status and redirect accordingly
      // The login function will return the session data
      const response = await fetch('/api/auth/session')
      const session = await response.json()
      
      if (session?.user?.activated === 'PENDING' || session?.user?.activated === 'NONE') {
        router.push('/Account_Activate')
      } else {
        router.push('/TCN_Home')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <input
              id="username"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              {...register("username", { required: "Username is required" })}
              disabled={isLoading}
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
              {...register("password", { required: "Password is required" })}
              disabled={isLoading}
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
      </CardContent>
    </Card>
  )
}