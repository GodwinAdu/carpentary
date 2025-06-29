"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { User, HardHat, Mail, Lock, Phone, MapPin, Briefcase, Star, Eye, EyeOff } from "lucide-react"
import { LoadingSpinner } from "./loading-spinner"


interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    initialMode?: "signin" | "signup"
    initialRole?: "client" | "worker"
}

export function AuthModal({ isOpen, onClose, initialMode = "signin", initialRole = "client" }: AuthModalProps) {
    const [mode, setMode] = useState<"signin" | "signup">(initialMode)
    const [role, setRole] = useState<"client" | "worker">(initialRole)
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
        phone: "",
        company: "",
        location: "",
        experience: "",
        specialties: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000))

        setIsLoading(false)
        onClose()

        // Show success message (you can implement toast notifications here)
        alert(`${mode === "signin" ? "Signed in" : "Account created"} successfully as ${role}!`)
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        {mode === "signin" ? "Welcome Back" : "Join CraftCarpentry"}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={mode} onValueChange={(value) => setMode(value as "signin" | "signup")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="signin" className="flex items-center gap-2">
                            Sign In
                        </TabsTrigger>
                        <TabsTrigger value="signup" className="flex items-center gap-2">
                            Sign Up
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Card
                                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${role === "client" ? "ring-2 ring-amber-500 bg-amber-50" : "hover:bg-slate-50"
                                    }`}
                                onClick={() => setRole("client")}
                            >
                                <CardContent className="p-4 text-center">
                                    <User className={`h-8 w-8 mx-auto mb-2 ${role === "client" ? "text-amber-600" : "text-slate-600"}`} />
                                    <h3 className="font-semibold">Client</h3>
                                    <p className="text-xs text-slate-600">Need carpentry services</p>
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
                                    <p className="text-xs text-slate-600">Provide carpentry services</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Sign in as {role === "client" ? "Client" : "Worker"}
                            </h3>
                            <p className="text-sm text-slate-600">
                                {role === "client"
                                    ? "Access your account to manage projects and requests"
                                    : "Access your worker dashboard and job opportunities"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signin-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="signin-email"
                                        type="email"
                                        placeholder="Enter your email"
                                        className="pl-10"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="signin-password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="signin-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="pl-10 pr-10"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className={`w-full ${role === "client"
                                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                        : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                                    }`}
                                disabled={isLoading}
                            >
                                {isLoading ? <LoadingSpinner /> : `Sign In as ${role === "client" ? "Client" : "Worker"}`}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setMode("signup")}
                                    className={`text-sm hover:underline ${role === "client" ? "text-blue-600 hover:text-blue-700" : "text-amber-600 hover:text-amber-700"
                                        }`}
                                >
                                    Don&#39;t have an account? Sign up
                                </button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4">
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

                        {/* Role-specific forms */}
                        {role === "client" ? (
                            // CLIENT SIGNUP FORM
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900">Create Client Account</h3>
                                    <p className="text-sm text-slate-600">Join to request carpentry services</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="client-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="client-email"
                                            type="email"
                                            placeholder="Enter your email"
                                            className="pl-10"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="client-phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="client-phone"
                                            type="tel"
                                            placeholder="+1 (555) 123-4567"
                                            className="pl-10"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company">Company (Optional)</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="company"
                                            placeholder="Your company name"
                                            className="pl-10"
                                            value={formData.company}
                                            onChange={(e) => handleInputChange("company", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="client-location">Location</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="client-location"
                                            placeholder="City, Province"
                                            className="pl-10"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange("location", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="client-password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="client-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a password"
                                            className="pl-10 pr-10"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange("password", e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="client-confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="client-confirmPassword"
                                            type="password"
                                            placeholder="Confirm your password"
                                            className="pl-10"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <LoadingSpinner /> : "Create Client Account"}
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setMode("signin")}
                                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                        Already have an account? Sign in
                                    </button>
                                </div>
                            </form>
                        ) : (
                            // WORKER SIGNUP FORM
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-semibold text-slate-900">Create Worker Account</h3>
                                    <p className="text-sm text-slate-600">Join our network of skilled carpenters</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="worker-firstName">First Name</Label>
                                        <Input
                                            id="worker-firstName"
                                            placeholder="John"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="worker-lastName">Last Name</Label>
                                        <Input
                                            id="worker-lastName"
                                            placeholder="Doe"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="worker-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="worker-email"
                                            type="email"
                                            placeholder="Enter your email"
                                            className="pl-10"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="worker-phone">Phone Number</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="worker-phone"
                                            type="tel"
                                            placeholder="+1 (555) 123-4567"
                                            className="pl-10"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="experience">Years of Experience</Label>
                                    <div className="relative">
                                        <Star className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="experience"
                                            placeholder="e.g., 5 years"
                                            className="pl-10"
                                            value={formData.experience}
                                            onChange={(e) => handleInputChange("experience", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="specialties">Specialties</Label>
                                    <Input
                                        id="specialties"
                                        placeholder="e.g., Roofing, Custom Furniture, Framing"
                                        value={formData.specialties}
                                        onChange={(e) => handleInputChange("specialties", e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="worker-location">Service Area</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="worker-location"
                                            placeholder="City, Province"
                                            className="pl-10"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange("location", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="worker-password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="worker-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create a password"
                                            className="pl-10 pr-10"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange("password", e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="worker-confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="worker-confirmPassword"
                                            type="password"
                                            placeholder="Confirm your password"
                                            className="pl-10"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <LoadingSpinner /> : "Create Worker Account"}
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setMode("signin")}
                                        className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
                                    >
                                        Already have an account? Sign in
                                    </button>
                                </div>
                            </form>
                        )}
                    </TabsContent>
                </Tabs>

                <div className="text-xs text-slate-500 text-center mt-4">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </div>
            </DialogContent>
        </Dialog>
    )
}
