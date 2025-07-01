"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, AlertCircle, RefreshCw, Shield } from "lucide-react"
import { deviceFingerprint } from "@/lib/security/device-fingerprint"
import { rateLimiter } from "@/lib/security/rate-limiter"
import { CaptchaChallenge, captchaManager } from "@/lib/security/captcha-manager"


interface VerificationFormProps {
    type?: "email" | "phone" | "2fa"
    contact?: string
    onVerify?: (code: string) => Promise<{ success: boolean; message?: string }>
    onResend?: () => Promise<{ success: boolean; message?: string }>
}

export function VerificationForm({ type = "email", contact = "", onVerify, onResend }: VerificationFormProps) {
    const [code, setCode] = useState(["", "", "", "", "", ""])
    const [isLoading, setIsLoading] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [resendCooldown, setResendCooldown] = useState(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [deviceId, setDeviceId] = useState<string>("")
    const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low")
    const [requiresCaptcha, setRequiresCaptcha] = useState(false)
    const [captchaChallenge, setCaptchaChallenge] = useState<CaptchaChallenge | null>(null)
    const [captchaAnswer, setCaptchaAnswer] = useState("")
    const [captchaStartTime, setCaptchaStartTime] = useState(0)
    const [isBlocked, setIsBlocked] = useState(false)
    const [blockTimeRemaining, setBlockTimeRemaining] = useState(0)
    const [securityWarning, setSecurityWarning] = useState("")

    // Cooldown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendCooldown])

    // Device fingerprinting and security initialization
    useEffect(() => {
        const initSecurity = async () => {
            // Generate device fingerprint
            const fingerprint = deviceFingerprint.generateFingerprint()
            setDeviceId(fingerprint.id)

            // Analyze device risk
            const risk = deviceFingerprint.analyzeDeviceRisk(fingerprint)
            setRiskLevel(risk.level)
            setRequiresCaptcha(risk.requiresVerification)

            // Check rate limiting
            const identifier = `${contact}-${fingerprint.id}`
            const rateLimitCheck = rateLimiter.isAllowed(identifier, "127.0.0.1") // Would use real IP

            if (!rateLimitCheck.allowed) {
                setIsBlocked(true)
                setBlockTimeRemaining(rateLimitCheck.retryAfter || 0)
                setError(
                    rateLimitCheck.reason === "IP_BLOCKED"
                        ? "Your IP has been temporarily blocked due to suspicious activity"
                        : `Too many attempts. Please try again in ${rateLimitCheck.retryAfter} seconds`,
                )
            }

            // Get security status
            const securityStatus = rateLimiter.getSecurityStatus(identifier)
            if (securityStatus.requiresCaptcha) {
                setRequiresCaptcha(true)
            }

            // Show security warnings
            if (risk.level === "high") {
                setSecurityWarning("Enhanced security verification required due to unusual device characteristics")
            } else if (risk.level === "medium") {
                setSecurityWarning("Additional verification required for security")
            }
        }

        initSecurity()
    }, [contact])

    // Block countdown timer
    useEffect(() => {
        if (blockTimeRemaining > 0) {
            const timer = setTimeout(() => {
                setBlockTimeRemaining(blockTimeRemaining - 1)
                if (blockTimeRemaining === 1) {
                    setIsBlocked(false)
                    setError("")
                }
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [blockTimeRemaining])

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) return // Prevent multiple characters

        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)
        setError("")

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-submit when all fields are filled
        if (newCode.every((digit) => digit !== "") && value) {
            handleVerify(newCode.join(""))
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
        if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        const newCode = pastedData.split("").concat(Array(6 - pastedData.length).fill(""))
        setCode(newCode)

        if (pastedData.length === 6) {
            handleVerify(pastedData)
        }
    }

    const handleVerify = async (verificationCode: string) => {
        if (verificationCode.length !== 6) {
            setError("Please enter a complete 6-digit code")
            return
        }

        // Check if blocked
        if (isBlocked) {
            setError(`Please wait ${blockTimeRemaining} seconds before trying again`)
            return
        }

        // Verify CAPTCHA if required
        if (requiresCaptcha && captchaChallenge) {
            const captchaResult = captchaManager.verifySolution(captchaChallenge.id, captchaAnswer, captchaStartTime)

            if (!captchaResult.success) {
                setError("CAPTCHA verification failed. Please try again.")
                generateNewCaptcha()
                return
            }
        }

        const identifier = `${contact}-${deviceId}`

        // Check rate limiting before attempt
        const rateLimitCheck = rateLimiter.isAllowed(identifier, "127.0.0.1")
        if (!rateLimitCheck.allowed) {
            setIsBlocked(true)
            setBlockTimeRemaining(rateLimitCheck.retryAfter || 0)
            setError("Rate limit exceeded. Please try again later.")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const result = await onVerify?.(verificationCode)

            // Record the attempt
            rateLimiter.recordAttempt(identifier, result?.success || false, "127.0.0.1")

            if (result?.success) {
                // Register as trusted device on success
                const fingerprint = deviceFingerprint.generateFingerprint()
                deviceFingerprint.registerTrustedDevice(fingerprint, contact)

                setSuccess(result.message || "Verification successful!")
            } else {
                setError(result?.message || "Invalid verification code")
                setCode(["", "", "", "", "", ""])
                inputRefs.current[0]?.focus()

                // Generate CAPTCHA after failed attempts
                const securityStatus = rateLimiter.getSecurityStatus(identifier)
                if (securityStatus.requiresCaptcha && !requiresCaptcha) {
                    setRequiresCaptcha(true)
                    generateNewCaptcha()
                }
            }
        } catch {
            rateLimiter.recordAttempt(identifier, false, "127.0.0.1")
            setError("Verification failed. Please try again.")
            setCode(["", "", "", "", "", ""])
            inputRefs.current[0]?.focus()
        } finally {
            setIsLoading(false)
        }
    }

    const handleResend = async () => {
        setIsResending(true)
        setError("")

        try {
            const result = await onResend?.()
            if (result?.success) {
                setSuccess(result.message || "Verification code sent!")
                setResendCooldown(60) // 60 second cooldown
                setCode(["", "", "", "", "", ""])
                inputRefs.current[0]?.focus()
            } else {
                setError(result?.message || "Failed to resend code")
            }
        } catch {
            setError("Failed to resend code. Please try again.")
        } finally {
            setIsResending(false)
        }
    }

    const generateNewCaptcha = () => {
        const challenge = captchaManager.generateChallenge(riskLevel === "high" ? "hard" : "medium")
        setCaptchaChallenge(challenge)
        setCaptchaAnswer("")
        setCaptchaStartTime(Date.now())
    }

    // Generate initial CAPTCHA if required
    useEffect(() => {
        if (requiresCaptcha && !captchaChallenge) {
            generateNewCaptcha()
        }
    }, [requiresCaptcha])

    const getTypeText = () => {
        switch (type) {
            case "phone":
                return "phone number"
            case "2fa":
                return "authenticator app"
            default:
                return "email address"
        }
    }

    const getMaskedContact = () => {
        if (!contact) return ""
        if (type === "email") {
            const [username, domain] = contact.split("@")
            return `${username.slice(0, 2)}***@${domain}`
        }
        if (type === "phone") {
            return `***-***-${contact.slice(-4)}`
        }
        return contact
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Enter Verification Code</h2>
                <p className="text-slate-400">
                    We&#39;ve sent a 6-digit code to your {getTypeText()}
                    {contact && <span className="block font-medium text-slate-300 mt-1">{getMaskedContact()}</span>}
                </p>
            </div>

            {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-400">{success}</AlertDescription>
                </Alert>
            )}

            {securityWarning && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <Shield className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-yellow-400">{securityWarning}</AlertDescription>
                </Alert>
            )}

            {riskLevel !== "low" && (
                <div className="text-center p-3 bg-slate-800/50 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">Security Level: {riskLevel.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-slate-400">Enhanced security measures are active to protect your account</p>
                </div>
            )}

            <div className="space-y-4">
                <Label htmlFor="verification-code" className="text-sm font-medium">
                    Verification Code
                </Label>

                <div className="flex justify-center gap-3">
                    {code.map((digit, index) => (
                        <Input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value.replace(/\D/g, ""))}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            className="w-12 h-12 text-center text-lg font-bold bg-slate-800 border-slate-600 focus:border-brand-primary focus:ring-brand-primary"
                            disabled={isLoading}
                        />
                    ))}
                </div>
            </div>

            {requiresCaptcha && captchaChallenge && (
                <div className="space-y-4 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-yellow-500" />
                        <Label className="text-sm font-medium text-yellow-400">Security Verification Required</Label>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">{captchaChallenge.question}</Label>
                        {captchaChallenge.type === "slider" ? (
                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={captchaAnswer || "50"}
                                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                                    className="w-full"
                                />
                                <div className="text-center text-sm text-slate-400">Value: {captchaAnswer || "50"}</div>
                            </div>
                        ) : (
                            <Input
                                type="text"
                                value={captchaAnswer}
                                onChange={(e) => setCaptchaAnswer(e.target.value)}
                                placeholder="Enter your answer"
                                className="bg-slate-800 border-slate-600"
                            />
                        )}
                    </div>
                </div>
            )}

            <Button
                onClick={() => handleVerify(code.join(""))}
                disabled={isLoading || code.some((digit) => !digit)}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                    </>
                ) : (
                    "Verify Code"
                )}
            </Button>

            <div className="text-center space-y-2">
                <p className="text-sm text-slate-400">Didn&rsquo;t receive the code?</p>
                <Button
                    variant="ghost"
                    onClick={handleResend}
                    disabled={isResending || resendCooldown > 0}
                    className="text-brand-primary hover:text-brand-primary/90 hover:bg-brand-primary/10"
                >
                    {isResending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                        </>
                    ) : resendCooldown > 0 ? (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Resend in {resendCooldown}s
                        </>
                    ) : (
                        <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Resend Code
                        </>
                    )}
                </Button>
            </div>

            <div className="text-center">
                <p className="text-xs text-slate-500">Code expires in 10 minutes</p>
            </div>
        </div>
    )
}
