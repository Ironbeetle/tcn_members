import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"

type ProfileFormData = {
  gender?: string
  o_r_status: string
  community: string
  address: string
  phone_number: string
  email: string
  image_url?: string
}

interface ProfileFormProps {
  onSubmit: (data: ProfileFormData) => Promise<void>
  initialData?: Partial<ProfileFormData>
  isLoading?: boolean
}

export default function ProfileForm({ onSubmit, initialData, isLoading = false }: ProfileFormProps) {
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: initialData
  })

  const handleFormSubmit = async (data: ProfileFormData) => {
    setError("")
    setSuccess(false)
    
    try {
      await onSubmit(data)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Member Profile</CardTitle>
        <CardDescription>
          Update your contact information and community details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="p-3 mb-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">Profile updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Gender (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender (Optional)</Label>
            <select
              id="gender"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              {...register("gender")}
              disabled={isLoading}
            >
              <option value="">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* On/Off Reserve Status (Required) */}
          <div className="space-y-2">
            <Label htmlFor="o_r_status">Reserve Status *</Label>
            <select
              id="o_r_status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              {...register("o_r_status", { 
                required: "Reserve status is required" 
              })}
              disabled={isLoading}
            >
              <option value="">Select status</option>
              <option value="On Reserve">On Reserve</option>
              <option value="Off Reserve">Off Reserve</option>
            </select>
            {errors.o_r_status && (
              <p className="text-sm text-red-600">{errors.o_r_status.message}</p>
            )}
          </div>

          {/* Community (Required) */}
          <div className="space-y-2">
            <Label htmlFor="community">Community *</Label>
            <input
              id="community"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              {...register("community", { 
                required: "Community is required" 
              })}
              disabled={isLoading}
              placeholder="Enter your community name"
            />
            {errors.community && (
              <p className="text-sm text-red-600">{errors.community.message}</p>
            )}
          </div>

          {/* Address (Required) */}
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <textarea
              id="address"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              {...register("address", { 
                required: "Address is required" 
              })}
              disabled={isLoading}
              placeholder="Enter your full address"
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* Phone Number (Required) */}
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number *</Label>
            <input
              id="phone_number"
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              {...register("phone_number", { 
                required: "Phone number is required",
                pattern: {
                  value: /^[\d\s\-\+\(\)]+$/,
                  message: "Please enter a valid phone number"
                }
              })}
              disabled={isLoading}
              placeholder="(204) 555-1234"
            />
            {errors.phone_number && (
              <p className="text-sm text-red-600">{errors.phone_number.message}</p>
            )}
          </div>

          {/* Email (Required) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address"
                }
              })}
              disabled={isLoading}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Image URL (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="image_url">Profile Image URL (Optional)</Label>
            <input
              id="image_url"
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              {...register("image_url", {
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "Please enter a valid URL"
                }
              })}
              disabled={isLoading}
              placeholder="https://example.com/photo.jpg"
            />
            {errors.image_url && (
              <p className="text-sm text-red-600">{errors.image_url.message}</p>
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
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
