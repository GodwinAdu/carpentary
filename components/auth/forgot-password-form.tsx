"use client"

import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

const ForgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
})

type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>

export function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(ForgotPasswordSchema),
    })

    const onSubmit: SubmitHandler<ForgotPasswordFormValues> = async (data) => {
        setIsLoading(true)
        setError(null)
        setSuccessMessage(null)

        // Simulate API call to request password reset
        await new Promise((resolve) => setTimeout(resolve, 1500))
        console.log("Requesting password reset for:", data.email)

        // Example: if (requestFailed) setError("Could not process request. Please try again.");
        // else setSuccessMessage("If an account exists for this email, a password reset link has been sent.");

        // For demo purposes, always show success
        setSuccessMessage(
            "If an account exists for " +
            data.email +
            ", a password reset link has been sent. Please check your inbox (and spam folder).",
        )
        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md">{error}</p>}
            {successMessage && <p className="text-sm text-green-500 bg-green-500/10 p-3 rounded-md">{successMessage}</p>}

            {!successMessage && ( // Hide form fields after success message
                <>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            {...register("email")}
                            className="transition-all duration-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 hover:border-amber-300"
                            disabled={isLoading}
                        />
                        {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
                    </Button>
                </>
            )}
        </form>
    )
}
