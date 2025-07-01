"use client"

import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Loader2 } from "lucide-react"

const LoginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
})

type LoginFormValues = z.infer<typeof LoginSchema>

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(LoginSchema),
    })

    const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
        setIsLoading(true)
        setError(null)
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))
        console.log("Login data:", data)
        // Replace with actual login logic
        // Example: if (loginFailed) setError("Invalid email or password.");
        setIsLoading(false)
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && <p className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md">{error}</p>}
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
                <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" passHref>
                        <span className="text-xs text-slate-400 hover:text-brand-primary cursor-pointer">Forgot password?</span>
                    </Link>
                </div>
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
            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
            </Button>
        </form>
    )
}
