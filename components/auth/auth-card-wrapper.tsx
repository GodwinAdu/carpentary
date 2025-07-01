import type React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"


interface AuthCardWrapperProps {
    children: React.ReactNode
    title: string
    description: string
    backButtonLabel: string
    backButtonHref: string
    showSocial?: boolean
}

export function AuthCardWrapper({
    children,
    title,
    description,
    backButtonLabel,
    backButtonHref,
    showSocial,
}: AuthCardWrapperProps) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-4">
            <Card className="w-full max-w-md bg-slate-900/80 backdrop-blur-lg border-slate-700/50 text-slate-50 shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">{title}</CardTitle>
                    <CardDescription className="text-slate-400">{description}</CardDescription>
                </CardHeader>
                <CardContent>{children}</CardContent>
                {showSocial && (
                    <CardFooter className="flex flex-col gap-4">
                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-700" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-900 px-2 text-slate-400">Or continue with</span>
                            </div>
                        </div>
                        {/* Placeholder for social buttons */}
                        <button className="w-full py-2.5 px-4 border border-slate-700 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors flex items-center justify-center">
                            {/* Replace with actual Google icon */}
                            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                <path d="M1 1h22v22H1z" fill="none" />
                            </svg>
                            Sign in with Google
                        </button>
                    </CardFooter>
                )}
                <CardFooter className="flex justify-center">
                    <Link href={backButtonHref} className="text-sm text-slate-400 hover:text-brand-primary transition-colors">
                        {backButtonLabel}
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
