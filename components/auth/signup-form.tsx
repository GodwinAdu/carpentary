"use client"

import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Loader2 } from "lucide-react"

const SignupSchema = z
    .object({
        name: z.string().min(2, { message: "Name must be at least 2 characters." }),
        email: z.string().email({ message: "Please enter a valid email address." }),
        password: z.string().min(8, { message: "Password must be at least 8 characters." }),
        confirmPassword: z.string(),
        terms: z.boolean().refine((val) => val === true, {
            message: "You must accept the terms and conditions.",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match.",
        path: ["confirmPassword"], // path to field that gets the error
    })

type SignupFormValues = z.infer<typeof SignupSchema>

export function SignupForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            terms: false,
        },
    })

    const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
        setIsLoading(true)
        setError(null)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))
        console.log("Signup data:", data)
        // Replace with actual signup logic
        // Example: if (signupFailed) setError("Could not create account. Please try again.");
        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md">{error}</p>}
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    placeholder="John Doe"
                    {...register("name")}
                    className="bg-slate-800 border-slate-700 focus:border-brand-primary text-slate-50"
                    disabled={isLoading}
                />
                {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register("email")}
                    className="bg-slate-800 border-slate-700 focus:border-brand-primary text-slate-50"
                    disabled={isLoading}
                />
                {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="bg-slate-800 border-slate-700 focus:border-brand-primary text-slate-50"
                    disabled={isLoading}
                />
                {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className="bg-slate-800 border-slate-700 focus:border-brand-primary text-slate-50"
                    disabled={isLoading}
                />
                {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>}
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="terms"
                    {...register("terms")}
                    className="border-slate-600 data-[state=checked]:bg-brand-primary data-[state=checked]:text-primary-foreground"
                    disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-xs text-slate-400">
                    I agree to the{" "}
                    <Link href="/terms" className="underline hover:text-brand-primary">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="underline hover:text-brand-primary">
                        Privacy Policy
                    </Link>
                    .
                </Label>
            </div>
            {errors.terms && <p className="text-sm text-red-400">{errors.terms.message}</p>}

            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
        </form>
    )
}
