"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper"
import { VerificationForm } from "@/components/auth/verification-form"

function PhoneVerifyContent() {
    const searchParams = useSearchParams()
    const phone = searchParams.get("phone") || ""

    const handleVerify = async (code: string) => {
        // Simulate API call for phone verification
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Mock verification logic
        if (code === "654321") {
            return { success: true, message: "Phone number verified successfully!" }
        } else {
            return { success: false, message: "Invalid verification code. Please try again." }
        }
    }

    const handleResend = async () => {
        // Simulate API call for resending SMS
        await new Promise((resolve) => setTimeout(resolve, 1000))

        return { success: true, message: "SMS verification code sent!" }
    }

    return (
        <AuthCardWrapper
            title="Verify Phone Number"
            description="We've sent a verification code via SMS"
            backButtonLabel="Back to settings"
            backButtonHref="/dashboard/settings"
        >
            <VerificationForm type="phone" contact={phone} onVerify={handleVerify} onResend={handleResend} />
        </AuthCardWrapper>
    )
}

export default function PhoneVerifyPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                </div>
            }
        >
            <PhoneVerifyContent />
        </Suspense>
    )
}
