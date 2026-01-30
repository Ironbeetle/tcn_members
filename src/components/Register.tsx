'use client'
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { 
  sanitizeInput, 
  isValidUsername, 
  containsSuspiciousPatterns 
} from "@/lib/security"
import { verifyMemberIdentity, type VerifyMemberResult } from "@/lib/actions"

type VerificationFormData = {
  t_number: string
  birthdate: string
}

type ActivateAccountFormData = {
  t_number: string
  username: string
  email: string
  password: string
  confirmPassword: string
  honeypot?: string  // Honeypot field to catch bots
}

type VerifiedMember = {
  firstName: string
  lastName: string
  tNumber: string
}

export default function Register() {
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verifiedMember, setVerifiedMember] = useState<VerifiedMember | null>(null)
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [showBirthdate, setShowBirthdate] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { createCredentials } = useAuth()
  const router = useRouter()
  
  const { register: registerVerify, handleSubmit: handleVerifySubmit, formState: { errors: verifyErrors } } = useForm<VerificationFormData>()
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ActivateAccountFormData>()
  
  const password = watch("password")

  // Verification mutation using TanStack Query
  const verificationMutation = useMutation({
    mutationFn: async (data: VerificationFormData): Promise<VerifyMemberResult> => {
      return verifyMemberIdentity(
        sanitizeInput(data.t_number),
        data.birthdate
      )
    },
    onSuccess: (result) => {
      if (result.success && result.verified && result.member) {
        setIsVerified(true)
        setVerifiedMember(result.member)
        setValue("t_number", result.member.tNumber)
        setAttemptsRemaining(null)
        setError("")
      } else {
        if (result.isLocked) {
          setIsLocked(true)
          setAttemptsRemaining(0)
        } else if (result.attemptsRemaining !== undefined) {
          setAttemptsRemaining(result.attemptsRemaining)
        }
        setError(result.error || "Verification failed")
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Verification failed. Please try again.")
    }
  })

  // Account creation mutation
  const activationMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      if (!verifiedMember) throw new Error("Not verified")
      return createCredentials(
        verifiedMember.tNumber,
        data.username,
        data.email,
        data.password
      )
    },
    onSuccess: () => {
      setSuccess(true)
      setTimeout(() => {
        router.push('/Account_Activate')
      }, 1500)
    },
    onError: (err: Error) => {
      setError(err.message || "Account activation failed. Please try again.")
    }
  })

  const isLoading = activationMutation.isPending
  const isVerifying = verificationMutation.isPending

  // Show birthdate field when treaty number has value
  const handleTNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setShowBirthdate(value.length > 0)
    // Reset error when user starts typing
    if (error && !isLocked) {
      setError("")
    }
  }

  // Verify treaty number and birthdate
  const onVerify = (data: VerificationFormData) => {
    if (isLocked) return
    verificationMutation.mutate(data)
  }

  const onSubmit = async (data: ActivateAccountFormData) => {
    // Ensure user is verified before proceeding
    if (!isVerified || !verifiedMember) {
      setError("Please complete verification first.")
      return
    }

    // Check honeypot - if filled, it's likely a bot
    if (data.honeypot) {
      setError("Registration failed. Please try again.")
      return
    }

    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(data.username)
    const sanitizedEmail = sanitizeInput(data.email)

    // Check for suspicious patterns in any field
    if (containsSuspiciousPatterns(data.username) || 
        containsSuspiciousPatterns(data.email)) {
      setError("Invalid input detected.")
      return
    }

    // Validate username format
    if (!isValidUsername(sanitizedUsername)) {
      setError("Invalid username format. Use only letters, numbers, and underscores (3-30 characters).")
      return
    }

    setError("")
    
    // Use mutation for account creation
    activationMutation.mutate({
      username: sanitizedUsername,
      email: sanitizedEmail,
      password: data.password
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Activate Your Member Account</CardTitle>
        <CardDescription>
          {isVerified 
            ? `Welcome, ${verifiedMember?.firstName}! Create your login credentials below.`
            : "Enter your Treaty Number and Date of Birth to verify your identity"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">
              Credentials created successfully! Redirecting to member portal...
            </p>
          </div>
        ) : isLocked ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="font-semibold text-red-700">Account Locked</p>
            </div>
            <p className="text-sm text-red-600">
              This treaty number has been locked due to too many failed verification attempts. 
              Please contact the system administrator at the Band Office for assistance.
            </p>
          </div>
        ) : !isVerified ? (
          /* Step 1: Verification Form */
          <form onSubmit={handleVerifySubmit(onVerify)} className="space-y-4">
            <div className="pb-4 border-b">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Member Verification</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verify_t_number">Treaty Number</Label>
                  <input
                    id="verify_t_number"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...registerVerify("t_number", { 
                      required: "Treaty number is required",
                      onChange: handleTNumberChange
                    })}
                    disabled={isVerifying}
                    placeholder="T12345 or 12345"
                  />
                  {verifyErrors.t_number && (
                    <p className="text-sm text-red-600">{verifyErrors.t_number.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Enter your treaty number as it appears in our records
                  </p>
                </div>

                {/* Birthdate field - only shown when treaty number is entered */}
                {showBirthdate && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="birthdate">Date of Birth</Label>
                    <input
                      id="birthdate"
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      {...registerVerify("birthdate", { 
                        required: "Date of birth is required"
                      })}
                      disabled={isVerifying}
                      max={new Date().toISOString().split('T')[0]}
                    />
                    {verifyErrors.birthdate && (
                      <p className="text-sm text-red-600">{verifyErrors.birthdate.message}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Enter your date of birth to verify your identity
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
                {attemptsRemaining !== null && attemptsRemaining > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before lockout.
                  </p>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-amber-700 hover:bg-amber-800"
              disabled={isVerifying || !showBirthdate}
            >
              {isVerifying ? "Verifying..." : "Verify Identity"}
            </Button>
          </form>
        ) : (
          /* Step 2: Account Creation Form (after verification) */
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

            {/* Verified Member Info */}
            <div className="p-3 bg-green-50 border border-green-200 rounded-md mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-700">
                  <span className="font-semibold">Verified:</span> {verifiedMember?.firstName} {verifiedMember?.lastName}
                </p>
              </div>
            </div>

            {/* Hidden treaty number field */}
            <input type="hidden" {...register("t_number")} />

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
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...register("password", { 
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters"
                      }
                    })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...register("confirmPassword", { 
                      required: "Please confirm your password",
                      validate: value => value === password || "Passwords do not match"
                    })}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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

            <button
              type="button"
              onClick={() => {
                setIsVerified(false)
                setVerifiedMember(null)
                setShowBirthdate(false)
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Start over with different treaty number
            </button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}