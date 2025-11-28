'use client'
import { useState } from "react"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { useRequestPasswordReset } from "@/hooks/usePasswordReset"

type ForgotPasswordFormData = {
  email: string
}

export default function ForgotPassword() {
  const [success, setSuccess] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>()
  
  const { mutate: requestReset, isPending, error } = useRequestPasswordReset()

  const onSubmit = async (data: ForgotPasswordFormData) => {
    requestReset(data.email, {
      onSuccess: () => {
        setSuccess(true)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-amber-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">
                  If an account exists with that email, you will receive a PIN shortly. Check your email and use the button below to enter it.
                </p>
              </div>
              <Link href="/reset-password">
                <Button className="w-full bg-amber-700 hover:bg-amber-800">
                  Enter PIN & Reset Password
                </Button>
              </Link>
              <Link href="/TCN_Enter">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
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
                  disabled={isPending}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error.message}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-amber-700 hover:bg-amber-800"
                disabled={isPending}
              >
                {isPending ? "Sending..." : "Send Reset Link"}
              </Button>

              <Link href="/TCN_Enter">
                <Button variant="outline" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
