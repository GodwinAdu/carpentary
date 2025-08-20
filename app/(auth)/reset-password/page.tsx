import { AuthCardWrapper } from "@/components/auth/auth-card-wrapper"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Reset Password - GML Roofing Systems",
    description: "Set a new password for your GML Roofing Systems account.",
}

export default function ResetPasswordPage() {
    return (
        <AuthCardWrapper
            title="Reset Your Password"
            description="Enter your new password below. Make sure it's strong and memorable."
            backButtonLabel="Back to Sign In"
            backButtonHref="/sign-in"
        >
            <ResetPasswordForm />
        </AuthCardWrapper>
    )
}
