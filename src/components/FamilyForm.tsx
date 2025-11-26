import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"

type FamilyFormData = {
  spouse_fname?: string
  spouse_lname?: string
  dependents: number
}

interface FamilyFormProps {
  onSubmit: (data: FamilyFormData) => Promise<void>
  initialData?: Partial<FamilyFormData>
  isLoading?: boolean
}

export default function FamilyForm({ onSubmit, initialData, isLoading = false }: FamilyFormProps) {
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)
  
  const { register, handleSubmit, formState: { errors } } = useForm<FamilyFormData>({
    defaultValues: {
      dependents: 0,
      ...initialData
    }
  })

  const handleFormSubmit = async (data: FamilyFormData) => {
    setError("")
    setSuccess(false)
    
    try {
      await onSubmit(data)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update family information")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Family Information</CardTitle>
        <CardDescription>
          Update your spouse and dependent information
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="p-3 mb-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">Family information updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Spouse Information Section */}
          <div className="pb-4 border-b">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Spouse Information (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Spouse First Name */}
              <div className="space-y-2">
                <Label htmlFor="spouse_fname">Spouse First Name</Label>
                <input
                  id="spouse_fname"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  {...register("spouse_fname")}
                  disabled={isLoading}
                  placeholder="First name"
                />
              </div>

              {/* Spouse Last Name */}
              <div className="space-y-2">
                <Label htmlFor="spouse_lname">Spouse Last Name</Label>
                <input
                  id="spouse_lname"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  {...register("spouse_lname")}
                  disabled={isLoading}
                  placeholder="Last name"
                />
              </div>
            </div>
          </div>

          {/* Dependents Section */}
          <div className="space-y-2">
            <Label htmlFor="dependents">Number of Dependents *</Label>
            <input
              id="dependents"
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              {...register("dependents", { 
                required: "Number of dependents is required",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Number of dependents cannot be negative"
                },
                validate: {
                  isInteger: (value) => Number.isInteger(value) || "Must be a whole number"
                }
              })}
              disabled={isLoading}
              placeholder="0"
            />
            {errors.dependents && (
              <p className="text-sm text-red-600">{errors.dependents.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Enter the number of children or other dependents in your household
            </p>
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
            {isLoading ? "Saving..." : "Save Family Information"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
