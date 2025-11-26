'use client'
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"

type ActivateAccountFormData = {
  t_number: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

export default function Register() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const { createCredentials } = useAuth()
  const router = useRouter()
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ActivateAccountFormData>()
  
  const password = watch("password")

  const onSubmit = async (data: ActivateAccountFormData) => {
    setIsLoading(true)
    setError("")
    setSuccess(false)
    
    try {
      // Call create credentials endpoint (backend verifies t_number exists in fnmember table)
      await createCredentials(
        data.t_number,
        data.username, 
        data.email, 
        data.password
      )
      setSuccess(true)
      
      // Redirect to Account_Activate page to complete profile
      setTimeout(() => {
        router.push('/Account_Activate')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account activation failed. Please verify your treaty number.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Activate Your Member Account</CardTitle>
        <CardDescription>
          Enter your Treaty Number to create login credentials for the member portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">
              Credentials created successfully! Redirecting to member portal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Treaty Number Section */}
            <div className="pb-4 border-b">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Member Verification</h3>
              
              <div className="space-y-2">
                <Label htmlFor="t_number">Treaty Number</Label>
                <input
                  id="t_number"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  {...register("t_number", { 
                    required: "Treaty number is required"
                  })}
                  disabled={isLoading}
                  placeholder="T12345 or 12345"
                />
                {errors.t_number && (
                  <p className="text-sm text-red-600">{errors.t_number.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Enter your treaty number as it appears in our records
                </p>
              </div>
            </div>

            {/* Account Creation Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Create Your Login Credentials</h3>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <input
                  id="username"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  {...register("username", { 
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters"
                    }
                  })}
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  {...register("email", { 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
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
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters"
                    }
                  })}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  {...register("confirmPassword", { 
                    required: "Please confirm your password",
                    validate: value => value === password || "Passwords do not match"
                  })}
                  disabled={isLoading}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
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
              {isLoading ? "Activating Account..." : "Activate Account"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}