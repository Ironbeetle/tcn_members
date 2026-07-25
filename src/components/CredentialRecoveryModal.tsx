'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { X, AlertTriangle, CheckCircle, Mail, User, Lock } from "lucide-react"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { useAuth } from "@/contexts/AuthContext"
import { 
  sanitizeInput, 
  isValidUsername, 
  containsSuspiciousPatterns 
} from "@/lib/security"

type EmailLookupForm = {
  email: string
}

type CredentialsForm = {
  username: string
  password: string
  confirmPassword: string
}

type MemberData = {
  firstName: string
  lastName: string
  tNumber: string
  email: string
}

interface CredentialRecoveryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CredentialRecoveryModal({ isOpen, onClose }: CredentialRecoveryModalProps) {
  const [step, setStep] = useState<'info' | 'email' | 'credentials' | 'success'>('info')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [memberData, setMemberData] = useState<MemberData | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const { 
    register: registerEmail, 
    handleSubmit: handleEmailSubmit, 
    formState: { errors: emailErrors } 
  } = useForm<EmailLookupForm>()

  const { 
    register: registerCredentials, 
    handleSubmit: handleCredentialsSubmit, 
    formState: { errors: credentialErrors },
    watch 
  } = useForm<CredentialsForm>()

  const password = watch("password")

  const handleClose = () => {
    setStep('info')
    setError("")
    setMemberData(null)
    onClose()
  }

  const onEmailLookup = async (data: EmailLookupForm) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/auth/recover-credentials?email=${encodeURIComponent(data.email.toLowerCase())}`)
      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Email lookup failed. Please try again.")
        return
      }

      if (result.found && result.member) {
        setMemberData(result.member)
        setStep('credentials')
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const onCredentialsSubmit = async (data: CredentialsForm) => {
    if (!memberData) return

    // Validate username format
    const sanitizedUsername = sanitizeInput(data.username)
    if (!isValidUsername(sanitizedUsername)) {
      setError("Invalid username format. Use only letters, numbers, and underscores (3-20 characters).")
      return
    }

    if (containsSuspiciousPatterns(data.username)) {
      setError("Invalid input detected.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/recover-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: memberData.email,
          username: sanitizedUsername,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Credential recovery failed. Please try again.")
        return
      }

      setStep('success')

      // Auto-login after 2 seconds
      setTimeout(async () => {
        try {
          await login(sanitizedUsername, data.password)
          router.push('/TCN_Home')
        } catch {
          // If auto-login fails, just close and let them login manually
          handleClose()
        }
      }, 2000)

    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Info Step - Initial explanation */}
        {step === 'info' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Important Notice</h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-semibold text-amber-800 mb-2">Database Maintenance Notice</p>
                <p className="text-sm text-amber-700">
                  During a recent system maintenance and database update, login credentials for activated TCN member accounts were accidentally lost. We sincerely apologize for this inconvenience.
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-medium">What happened?</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
                  <li>Your profile information is <strong className="text-green-700">safe and intact</strong></li>
                  <li>Your family information is <strong className="text-green-700">safe and intact</strong></li>
                  <li>Only your <strong className="text-amber-700">login credentials</strong> (username & password) need to be re-entered</li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="font-medium">Who is affected?</p>
                <p className="text-sm text-gray-600">
                  TCN members who previously activated their accounts and set up login credentials. If you have never activated your account before, please use the "Activate Account" tab instead.
                </p>
              </div>

              <div className="space-y-3">
                <p className="font-medium">How to recover your account:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-2">
                  <li>Enter the email address from your TCN member profile</li>
                  <li>If found, create a new username and password</li>
                  <li>You'll be logged in automatically</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button 
                onClick={() => setStep('email')}
                className="bg-amber-700 hover:bg-amber-800"
              >
                Continue to Recovery
              </Button>
            </div>
          </div>
        )}

        {/* Email Lookup Step */}
        {step === 'email' && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Find Your Account</h2>
            </div>

            <p className="text-gray-600 mb-6">
              Enter the email address you used when activating your TCN member account.
            </p>

            <form onSubmit={handleEmailSubmit(onEmailLookup)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-email">Email Address</Label>
                <input
                  id="recovery-email"
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  {...registerEmail("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email address"
                    }
                  })}
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                />
                {emailErrors.email && (
                  <p className="text-sm text-red-600">{emailErrors.email.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('info')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-700 hover:bg-amber-800"
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Find My Account"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Credentials Form Step */}
        {step === 'credentials' && memberData && (
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Account Found!</h2>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <p className="text-green-800 font-medium">
                Welcome back, {memberData.firstName} {memberData.lastName}!
              </p>
              <p className="text-sm text-green-700 mt-1">
                Please create new login credentials for your account.
              </p>
            </div>

            <form onSubmit={handleCredentialsSubmit(onCredentialsSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recovery-username">New Username</Label>
                <input
                  id="recovery-username"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  {...registerCredentials("username", {
                    required: "Username is required",
                    minLength: { value: 3, message: "Username must be at least 3 characters" },
                    maxLength: { value: 20, message: "Username must be less than 20 characters" },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: "Username can only contain letters, numbers, and underscores"
                    }
                  })}
                  placeholder="Choose a username"
                  disabled={isLoading}
                  autoComplete="username"
                />
                {credentialErrors.username && (
                  <p className="text-sm text-red-600">{credentialErrors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recovery-password">New Password</Label>
                <div className="relative">
                  <input
                    id="recovery-password"
                    type={showPassword ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...registerCredentials("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Password must be at least 8 characters" },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: "Password must contain uppercase, lowercase, and a number"
                      }
                    })}
                    placeholder="Create a strong password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {credentialErrors.password && (
                  <p className="text-sm text-red-600">{credentialErrors.password.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, and a number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recovery-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <input
                    id="recovery-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...registerCredentials("confirmPassword", {
                      required: "Please confirm your password",
                      validate: value => value === password || "Passwords do not match"
                    })}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {credentialErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{credentialErrors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep('email')
                    setMemberData(null)
                    setError("")
                  }}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-700 hover:bg-amber-800"
                  disabled={isLoading}
                >
                  {isLoading ? "Recovering..." : "Recover Account"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">Account Recovered!</h2>
            <p className="text-gray-600 mb-4">
              Your login credentials have been restored successfully.
            </p>
            <p className="text-sm text-amber-700">
              Logging you in automatically...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
