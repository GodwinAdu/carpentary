"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { updateUser } from "@/lib/actions/user.actions"
import { createActivity } from "@/lib/actions/activity.actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const EditStaffSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  emergencyNumber: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  workLocation: z.enum(["on-site", "remote", "hybrid"]).optional(),
  bio: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
})

type EditStaffFormValues = z.infer<typeof EditStaffSchema>

interface EditStaffFormProps {
  staff: any
}

export function EditStaffForm({ staff }: EditStaffFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<EditStaffFormValues>({
    resolver: zodResolver(EditStaffSchema),
    defaultValues: {
      fullName: staff.fullName || '',
      email: staff.email || '',
      phoneNumber: staff.phoneNumber || '',
      emergencyNumber: staff.emergencyNumber || '',
      jobTitle: staff.jobTitle || '',
      department: staff.department || '',
      workLocation: staff.workLocation || 'on-site',
      bio: staff.bio || '',
      street: staff.address?.street || '',
      city: staff.address?.city || '',
      state: staff.address?.state || '',
      country: staff.address?.country || '',
      zipCode: staff.address?.zipCode || '',
    }
  })

  const onSubmit = async (data: EditStaffFormValues) => {
    setIsLoading(true)
    try {
      const updateData = {
        ...data,
        address: {
          street: data.street || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          zipCode: data.zipCode || '',
        }
      }

      const result = await updateUser(staff._id, updateData)
      
      if (result.success) {
        // Log the profile update activity
        await createActivity({
          userId: staff._id,
          type: 'profile_update',
          action: 'Profile information updated via edit form'
        })
        
        toast.success("Staff updated successfully")
        router.push(`/dashboard/hr/staffs/${staff._id}`)
      }
    } catch (error) {
      toast.error("Failed to update staff")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/hr/staffs/${staff._id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Details
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Staff</h1>
          <p className="text-slate-600">Update staff member information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Personal Information
            </CardTitle>
            <CardDescription>Basic personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  {...register("fullName")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600">{errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  {...register("phoneNumber")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyNumber">Emergency Contact</Label>
                <Input
                  id="emergencyNumber"
                  {...register("emergencyNumber")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle>Work Information</CardTitle>
            <CardDescription>Job-related details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  {...register("jobTitle")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  {...register("department")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workLocation">Work Location</Label>
                <Select onValueChange={(value) => setValue("workLocation", value as any)} defaultValue={staff.workLocation}>
                  <SelectTrigger className="transition-all duration-300 focus:ring-2 focus:ring-amber-500">
                    <SelectValue placeholder="Select work location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="on-site">On-site</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                {...register("bio")}
                className="transition-all duration-300 focus:ring-2 focus:ring-amber-500"
                disabled={isLoading}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>Residential address details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                {...register("street")}
                className="transition-all duration-300 focus:ring-2 focus:ring-amber-500"
                disabled={isLoading}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register("city")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  {...register("state")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  {...register("country")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  {...register("zipCode")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/hr/staffs/${staff._id}`}>Cancel</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}