import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Forgot Password - GML Roofing",
    description: "Request a password reset for your GML Roofing account.",
}

export default function ForgotPasswordPage() {
    return (
        <AuthCardWrapper
            title="Forgot Your Password?"
            description="No worries! Enter your email address below and we'll send you a link to reset your password."
            backButtonLabel="Back to Sign In"
            backButtonHref="/login"
        >
            <ForgotPasswordForm />
        </AuthCardWrapper>
    )
}
