"use client"

import { Suspense } from "react"
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper"
import { VerificationForm } from "@/components/auth/verification-form"

function TwoFactorContent() {
    const handleVerify = async (code: string) => {
        // Simulate API call for 2FA verification
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock verification logic
        if (code === "789012") {
            // Redirect to dashboard
            window.location.href = "/dashboard"
            return { success: true, message: "Authentication successful! Redirecting..." }
        } else {
            return { success: false, message: "Invalid authentication code. Please try again." }
        }
    }

    const handleResend = async () => {
        // For 2FA, this might generate a new backup code or send via SMS
        await new Promise((resolve) => setTimeout(resolve, 1000))

        return { success: true, message: "Backup code sent to your registered phone number." }
    }

    return (
        <AuthCardWrapper
            title="Two-Factor Authentication"
            description="Enter the 6-digit code from your authenticator app"
            backButtonLabel="Back to login"
            backButtonHref="/login"
        >
            <VerificationForm type="2fa" onVerify={handleVerify} onResend={handleResend} />
        </AuthCardWrapper>
    )
}

export default function TwoFactorPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                </div>
            }
        >
            <TwoFactorContent />
        </Suspense>
    )
}
