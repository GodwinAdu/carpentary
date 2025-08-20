"use client"

import { useState, useEffect, Suspense } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation" // For reading URL query params

const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>

function ResetPasswordFormComponent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null) // null: checking, true: valid, false: invalid

  useEffect(() => {
    // Simulate token validation
    if (token) {
      setIsLoading(true)
      setTimeout(() => {
        // Replace with actual token validation logic
        if (token === "valid-token-example") {
          // Example valid token
          setIsTokenValid(true)
        } else {
          setIsTokenValid(false)
          setError("Invalid or expired password reset token. Please request a new one.")
        }
        setIsLoading(false)
      }, 1000)
    } else {
      setIsTokenValid(false)
      setError("No reset token found. Please request a password reset.")
    }
  }, [token])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordSchema),
  })

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = async (data) => {
    if (!isTokenValid) return

    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    // Simulate API call to reset password
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log("Resetting password with token:", token, "New password:", data.password)

    // Example: if (resetFailed) setError("Could not reset password. Please try again.");
    // else setSuccessMessage("Your password has been successfully reset. You can now sign in.");

    // For demo purposes, always show success
    setSuccessMessage("Your password has been successfully reset. You can now sign in with your new password.")
    setIsLoading(false)
  }

  if (isTokenValid === null || (isLoading && isTokenValid === null)) {
    // Initial loading state for token check
    return (
      <div className="flex justify-center items-center h-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        <p className="ml-2 text-slate-400">Verifying token...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md">{error}</p>}
      {successMessage && <p className="text-sm text-green-500 bg-green-500/10 p-3 rounded-md">{successMessage}</p>}

      {!successMessage &&
        isTokenValid && ( // Hide form fields after success or if token is invalid
          <>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="transition-all duration-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300"
                disabled={isLoading}
              />
              {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...register("confirmPassword")}
                className="transition-all duration-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300"
                disabled={isLoading}
              />
              {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading || !isTokenValid}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
            </Button>
          </>
        )}
    </form>
  )
}

// Wrap with Suspense because useSearchParams() needs it
export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
        </div>
      }
    >
      <ResetPasswordFormComponent />
    </Suspense>
  )
}
