"use client"


import { LoadingSpinner } from "@/components/root/loading-spinner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { loginUser } from "@/lib/actions/login.actions"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const signInSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    rememberMe: z.boolean(),
})

type SignInFormData = z.infer<typeof signInSchema>

const SignInForm = () => {
    const [showPassword, setShowPassword] = useState(false)

    // Form instances
    const signInForm = useForm<SignInFormData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    })

    const isSubmitting = signInForm.formState.isSubmitting

    const handleSignIn = async (data: SignInFormData) => {
        try {
            const user = await loginUser(data)
            // In a real app, you might redirect or update global state
            window.location.assign("/dashboard") // Example redirect
            signInForm.reset()
            toast.success("Sign in successful!", {
                description: `Welcome back ${user.fullName}!`,
            })
        } catch (error) {
            console.error("Sign in error:", error)
            toast.error("Sign in failed", {
                description: (error as Error).message || "An unexpected error occurred. Please try again.",
            })
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-3xl font-bold">Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...signInForm}>
                    <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-6">
                        <FormField
                            control={signInForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input type="email" placeholder="Enter your email" className="pl-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signInForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative items-center">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Enter your password"
                                                className="pl-10 pr-10"
                                                {...field}
                                            />
                                            <Button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-0 text-muted-foreground hover:text-foreground"
                                                variant="ghost"
                                                size="icon"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={signInForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} ref={field.ref} id={field.name} />
                                    </FormControl>
                                    <FormLabel htmlFor={field.name} className="text-sm text-muted-foreground cursor-pointer">
                                        Remember Me for 30 days
                                    </FormLabel>
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className={`w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <LoadingSpinner /> : `Sign In to Your Account`}
                        </Button>
                        <div className="text-center">
                            <Button type="button" variant="link" className={`text-sm text-amber-600 hover:text-amber-700`}>
                                Don&#39;t have an account? Sign up
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default SignInForm
