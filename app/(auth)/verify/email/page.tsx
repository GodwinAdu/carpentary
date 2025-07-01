"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper"
import { VerificationForm } from "@/components/auth/verification-form"
import { toast } from "sonner"
import { verifyCode } from "@/lib/actions/code.actions"

function EmailVerifyContent() {
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""

    const handleVerify = async (code: string): Promise<{ success: boolean; message?: string }> => {
        try {
            if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
                throw new Error("Invalid code format. Please enter a 6-digit numeric code.")
            }

            // Simulate API call for verification
            await verifyCode(code, email)


            toast.success("Verification successful!", {
                description: "Your email has been successfully verified.",
            })

            window.location.assign("/sign-in")
            
            return { success: true, message: "Verification successful!" }
        } catch (error) {
            toast.error("Verification failed", {
                description: error instanceof Error ? error.message : "An error occurred during verification. Please try again.",
            })

            return { success: false, message: error instanceof Error ? error.message : "An error occurred during verification. Please try again." }
        }
    }

    const handleResend = async () => {
        // Simulate API call for resending email
        await new Promise((resolve) => setTimeout(resolve, 1000))

        return { success: true, message: "Verification email sent successfully!" }
    }

    return (
        <AuthCardWrapper
            title="Verify Your Email"
            description="We've sent a verification code to your email address"
            backButtonLabel="Back to signup"
            backButtonHref="/signup"
        >
            <VerificationForm type="email" contact={email} onVerify={handleVerify} onResend={handleResend} />
        </AuthCardWrapper>
    )
}

export default function EmailVerifyPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                </div>
            }
        >
            <EmailVerifyContent />
        </Suspense>
    )
}
