"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, HardHat, Mail, Lock, Phone, Eye, EyeOff } from "lucide-react"

import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createUser } from "@/lib/actions/user.actions"
import { LoadingSpinner } from "@/components/root/loading-spinner"
import Link from "next/link"



const clientSignUpSchema = z
    .object({
        fullName: z.string().min(2, "Full name must be at least 2 characters"),
        dob: z.string().min(1, "Date of birth is required"),
        email: z.string().email("Please enter a valid email address"),
        phone: z.string().min(10, "Please enter a valid phone number"),
        gender: z.string().min(1, "Please select your gender"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

const workerSignUpSchema = z
    .object({
        fullName: z.string().min(2, "Full name must be at least 2 characters"),
        dob: z.string().min(1, "Date of birth is required"),
        email: z.string().email("Please enter a valid email address"),
        phone: z.string().min(10, "Please enter a valid phone number"),
        gender: z.string().min(1, "Please select your gender"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })


type ClientSignUpFormData = z.infer<typeof clientSignUpSchema>
type WorkerSignUpFormData = z.infer<typeof workerSignUpSchema>

const SignUpForm = () => {
    const [role, setRole] = useState<"client" | "worker">("client")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const router = useRouter()

    const clientSignUpForm = useForm<ClientSignUpFormData>({
        resolver: zodResolver(clientSignUpSchema),
        defaultValues: {
            fullName: "",
            dob: "",
            email: "",
            phone: "",
            gender: "",
            password: "",
            confirmPassword: "",
        },
    })

    const workerSignUpForm = useForm<WorkerSignUpFormData>({
        resolver: zodResolver(workerSignUpSchema),
        defaultValues: {
            fullName: "",
            dob: "",
            email: "",
            phone: "",
            gender: "",
            password: "",
            confirmPassword: "",
        },
    })


    const handleClientSignUp = async (data: ClientSignUpFormData) => {
        setIsLoading(true)
        try {


        } catch (error) {
            console.error("Sign up error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleWorkerSignUp = async (data: WorkerSignUpFormData) => {
        setIsLoading(true)
        try {
            await createUser(data)
            workerSignUpForm.reset()
            router.push("/verify/email?email=" + data.email)
            toast.success("Worker account created successfully!")
        } catch (error) {
            console.error("Sign up error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="grid grid-cols-2 gap-4">
                <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${role === "client" ? "ring-2 ring-amber-500 bg-amber-50" : "hover:bg-slate-50"
                        }`}
                    onClick={() => setRole("client")}
                >
                    <CardContent className="p-4 text-center">
                        <User className={`h-8 w-8 mx-auto mb-2 ${role === "client" ? "text-amber-600" : "text-slate-600"}`} />
                        <h3 className="font-semibold">Client</h3>
                        <p className="text-xs text-slate-600">I need carpentry work</p>
                    </CardContent>
                </Card>

                <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${role === "worker" ? "ring-2 ring-amber-500 bg-amber-50" : "hover:bg-slate-50"
                        }`}
                    onClick={() => setRole("worker")}
                >
                    <CardContent className="p-4 text-center">
                        <HardHat
                            className={`h-8 w-8 mx-auto mb-2 ${role === "worker" ? "text-amber-600" : "text-slate-600"}`}
                        />
                        <h3 className="font-semibold">Worker</h3>
                        <p className="text-xs text-slate-600">I provide carpentry services</p>
                    </CardContent>
                </Card>
            </div>

            {role === "client" ? (
                <Form {...clientSignUpForm}>
                    <form onSubmit={clientSignUpForm.handleSubmit(handleClientSignUp)} className="space-y-4">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Create Client Account</h3>
                            <p className="text-sm text-slate-600">Join to request carpentry services</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={clientSignUpForm.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={clientSignUpForm.control}
                                name="dob"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={clientSignUpForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input type="email" placeholder="Enter your email" className="pl-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={clientSignUpForm.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input type="tel" placeholder="+1 (555) 123-4567" className="pl-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={clientSignUpForm.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={clientSignUpForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a password"
                                                className="pl-10 pr-10"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={clientSignUpForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                className="pl-10 pr-10"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                            disabled={isLoading}
                        >
                            {isLoading ? <LoadingSpinner /> : "Create Client Account"}
                        </Button>

                        <div className="text-center">
                            <Link
                                href="/sign-in"
                                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </form>
                </Form>
            ) : (
                /* Worker Sign Up Form */
                <Form {...workerSignUpForm}>
                    <form onSubmit={workerSignUpForm.handleSubmit(handleWorkerSignUp)} className="space-y-4">
                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Create Worker Account</h3>
                            <p className="text-sm text-slate-600">Join our network of skilled carpenters</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={workerSignUpForm.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={workerSignUpForm.control}
                                name="dob"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={workerSignUpForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input type="email" placeholder="Enter your email" className="pl-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={workerSignUpForm.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input type="tel" placeholder="+1 (555) 123-4567" className="pl-10" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={workerSignUpForm.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gender</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={workerSignUpForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Create a password"
                                                className="pl-10 pr-10"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={workerSignUpForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm your password"
                                                className="pl-10 pr-10"
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                            disabled={isLoading}
                        >
                            {isLoading ? <LoadingSpinner /> : "Create Worker Account"}
                        </Button>
                        <div className="text-center">
                            <Link
                                href="/sign-in"
                                className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
                            >
                                Already have an account? Sign in
                            </Link>
                        </div>
                    </form>
                </Form>
            )}
        </>
    )
}

export default SignUpForm