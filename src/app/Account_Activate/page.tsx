"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Hamburger } from "@/components/Hamburger"
import { UserSessionBar } from "@/components/UserSessionBar"
import { createProfile, createFamily } from "@/lib/actions"
import { toast } from "sonner"

type ProfileFormData = {
  gender?: "MALE" | "FEMALE" | "OTHER" | null
  o_r_status: string
  community: string
  address: string
  phone_number: string
  email: string
  image_url?: string
}

type FamilyFormData = {
  spouse_fname?: string
  spouse_lname?: string
  dependents: number
}

export default function AccountActivatePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [step, setStep] = useState<"profile" | "family">("profile")

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm<ProfileFormData>()
  const { register: registerFamily, handleSubmit: handleSubmitFamily, formState: { errors: familyErrors } } = useForm<FamilyFormData>({
    defaultValues: { dependents: 0 }
  })

  // Mutation for completing activation
  const activationMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/complete-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })
      if (!response.ok) {
        throw new Error("Failed to complete activation")
      }
      return response.json()
    },
    onSuccess: async () => {
      toast.success("Account activation complete!")
      await update()
      setTimeout(() => router.push("/TCN_Home"), 1000)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to complete activation")
    }
  })

  // Profile mutation
  const profileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const result = await createProfile({
        ...data,
        fnmemberId: session?.user?.id || "",
      })
      if (!result.success) {
        throw new Error(result.error || "Failed to create profile")
      }
      return result
    },
    onSuccess: () => {
      toast.success("Profile created successfully!")
      setStep("family")
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred while creating profile")
    }
  })

  // Family mutation
  const familyMutation = useMutation({
    mutationFn: async (data: FamilyFormData) => {
      const result = await createFamily({
        ...data,
        fnmemberId: session?.user?.id || "",
      })
      if (!result.success) {
        throw new Error(result.error || "Failed to create family record")
      }
      return result
    },
    onSuccess: () => {
      // Complete activation after family is created
      if (session?.user?.id) {
        activationMutation.mutate(session.user.id)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "An error occurred while creating family record")
    }
  })

  const isLoading = profileMutation.isPending || familyMutation.isPending || activationMutation.isPending

  const menuItems = [
    { label: "Home", to: "/", color: "stone" as const },
  ]

  if (status === "loading") {
    return (
      <div className="w-full min-h-screen genbkg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/TCN_Enter")
    return null
  }

  const onSubmitProfile = (data: ProfileFormData) => {
    profileMutation.mutate(data)
  }

  const onSubmitFamily = (data: FamilyFormData) => {
    familyMutation.mutate(data)
  }

  const skipFamily = () => {
    if (session?.user?.id) {
      activationMutation.mutate(session.user.id)
    }
  }

  return (
    <div className="w-full min-h-screen genbkg">
      {/* Navigation with user info and logout */}
      <div className="sticky top-0 z-50">
        <div className="lg:hidden">
          <Hamburger menuItems={menuItems} showBackButton={false} />
        </div>
        <UserSessionBar showLogo={true} />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">Complete Your Account Activation</h1>
          <p className="text-gray-600">
            Step {step === "profile" ? "1" : "2"} of 2: {step === "profile" ? "Personal Information" : "Family Information"}
          </p>
        </div>

        {step === "profile" ? (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Please provide your personal contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...registerProfile("gender")}
                    disabled={isLoading}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="o_r_status">On/Off Reserve Status *</Label>
                  <select
                    id="o_r_status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...registerProfile("o_r_status", { required: "Status is required" })}
                    disabled={isLoading}
                  >
                    <option value="">Select status</option>
                    <option value="ON_RESERVE">On Reserve</option>
                    <option value="OFF_RESERVE">Off Reserve</option>
                  </select>
                  {profileErrors.o_r_status && (
                    <p className="text-sm text-red-600">{profileErrors.o_r_status.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="community">Community *</Label>
                  <input
                    id="community"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...registerProfile("community", { required: "Community is required" })}
                    disabled={isLoading}
                  />
                  {profileErrors.community && (
                    <p className="text-sm text-red-600">{profileErrors.community.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <textarea
                    id="address"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...registerProfile("address", { required: "Address is required" })}
                    disabled={isLoading}
                  />
                  {profileErrors.address && (
                    <p className="text-sm text-red-600">{profileErrors.address.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number *</Label>
                  <input
                    id="phone_number"
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...registerProfile("phone_number", { required: "Phone number is required" })}
                    disabled={isLoading}
                  />
                  {profileErrors.phone_number && (
                    <p className="text-sm text-red-600">{profileErrors.phone_number.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...registerProfile("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    disabled={isLoading}
                  />
                  {profileErrors.email && (
                    <p className="text-sm text-red-600">{profileErrors.email.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-amber-700 hover:bg-amber-800"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Continue to Family Information"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Family Information</CardTitle>
              <CardDescription>
                Optional: Add information about your family (you can skip this step)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitFamily(onSubmitFamily)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spouse_fname">Spouse First Name</Label>
                  <input
                    id="spouse_fname"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...registerFamily("spouse_fname")}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spouse_lname">Spouse Last Name</Label>
                  <input
                    id="spouse_lname"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...registerFamily("spouse_lname")}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dependents">Number of Dependents</Label>
                  <input
                    id="dependents"
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    {...registerFamily("dependents", { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-amber-700 hover:bg-amber-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Complete Activation"}
                  </Button>
                  <Button 
                    type="button"
                    onClick={skipFamily}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Skip
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
