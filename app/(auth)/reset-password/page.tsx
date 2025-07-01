import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Reset Password - BotX",
    description: "Set a new password for your BotX account.",
}

export default function ResetPasswordPage() {
    return (
        <AuthCardWrapper
            title="Reset Your Password"
            description="Enter your new password below. Make sure it's strong and memorable."
            backButtonLabel="Back to Sign In"
            backButtonHref="/login"
        >
            <ResetPasswordForm />
        </AuthCardWrapper>
    )
}
