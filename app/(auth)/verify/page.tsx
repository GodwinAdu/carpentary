"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper"
import { VerificationForm } from "@/components/auth/verification-form"

function VerifyContent() {
    const searchParams = useSearchParams()
    const type = (searchParams.get("type") as "email" | "phone" | "2fa") || "email"
    const contact = searchParams.get("contact") || ""

    const handleVerify = async (code: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock verification logic
        if (code === "123456") {
            return { success: true, message: "Email verified successfully!" }
        } else {
            return { success: false, message: "Invalid verification code. Please try again." }
        }
    }

    const handleResend = async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock resend logic
        return { success: true, message: "New verification code sent!" }
    }

    const getTitle = () => {
        switch (type) {
            case "phone":
                return "Verify Phone Number"
            case "2fa":
                return "Two-Factor Authentication"
            default:
                return "Verify Email Address"
        }
    }

    const getDescription = () => {
        switch (type) {
            case "phone":
                return "Enter the code sent to your phone"
            case "2fa":
                return "Enter the code from your authenticator app"
            default:
                return "Enter the code sent to your email"
        }
    }

    return (
        <AuthCardWrapper
            title={getTitle()}
            description={getDescription()}
            backButtonLabel="Back to login"
            backButtonHref="/login"
        >
            <VerificationForm type={type} contact={contact} onVerify={handleVerify} onResend={handleResend} />
        </AuthCardWrapper>
    )
}

export default function VerifyPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                </div>
            }
        >
            <VerifyContent />
        </Suspense>
    )
}
