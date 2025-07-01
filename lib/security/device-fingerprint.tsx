interface DeviceFingerprint {
    id: string
    userAgent: string
    screen: string
    timezone: string
    language: string
    platform: string
    cookieEnabled: boolean
    doNotTrack: boolean
    canvas?: string
    webgl?: string
    fonts?: string[]
    plugins?: string[]
    createdAt: number
}

interface DeviceRisk {
    level: "low" | "medium" | "high"
    factors: string[]
    score: number
    requiresVerification: boolean
}

class DeviceFingerprintManager {
    private knownDevices = new Map<string, DeviceFingerprint>()
    private suspiciousDevices = new Set<string>()

    // Generate device fingerprint
    generateFingerprint(): DeviceFingerprint {
        const canvas = this.getCanvasFingerprint()
        const webgl = this.getWebGLFingerprint()
        const fonts = this.getAvailableFonts()
        const plugins = this.getPluginList()

        const fingerprint: DeviceFingerprint = {
            id: this.generateFingerprintId(),
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}x${screen.colorDepth}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack === "1",
            canvas,
            webgl,
            fonts,
            plugins,
            createdAt: Date.now(),
        }

        return fingerprint
    }

    // Analyze device risk
    analyzeDeviceRisk(fingerprint: DeviceFingerprint): DeviceRisk {
        const factors: string[] = []
        let score = 0

        // Check if device is known
        const knownDevice = this.knownDevices.get(fingerprint.id)
        if (!knownDevice) {
            factors.push("unknown_device")
            score += 30
        }

        // Check for suspicious characteristics
        if (this.suspiciousDevices.has(fingerprint.id)) {
            factors.push("flagged_device")
            score += 50
        }

        // Check for automation indicators
        if (this.detectAutomation(fingerprint)) {
            factors.push("automation_detected")
            score += 40
        }

        // Check for VPN/Proxy indicators
        if (this.detectVPN(fingerprint)) {
            factors.push("vpn_proxy_detected")
            score += 25
        }

        // Check for inconsistencies
        if (knownDevice && this.detectInconsistencies(fingerprint, knownDevice)) {
            factors.push("device_inconsistencies")
            score += 35
        }

        // Determine risk level
        let level: "low" | "medium" | "high" = "low"
        if (score >= 70) level = "high"
        else if (score >= 40) level = "medium"

        return {
            level,
            factors,
            score,
            requiresVerification: level === "high" || factors.includes("unknown_device"),
        }
    }

    // Register trusted device
    registerTrustedDevice(fingerprint: DeviceFingerprint, userIdentifier: string): void {
        this.knownDevices.set(fingerprint.id, fingerprint)
        this.suspiciousDevices.delete(fingerprint.id)

        console.log(`[SECURITY] Trusted device registered for user ${userIdentifier}`)
    }

    // Flag suspicious device
    flagSuspiciousDevice(fingerprint: DeviceFingerprint, reason: string): void {
        this.suspiciousDevices.add(fingerprint.id)

        console.log(`[SECURITY] Device flagged as suspicious: ${reason}`, {
            deviceId: fingerprint.id,
            userAgent: fingerprint.userAgent,
        })
    }

    // Generate unique fingerprint ID
    private generateFingerprintId(): string {
        const data = [
            navigator.userAgent,
            screen.width + "x" + screen.height,
            navigator.language,
            navigator.platform,
            new Date().getTimezoneOffset(),
        ].join("|")

        return this.simpleHash(data)
    }

    // Get canvas fingerprint
    private getCanvasFingerprint(): string {
        try {
            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")
            if (!ctx) return ""

            canvas.width = 200
            canvas.height = 50

            ctx.textBaseline = "top"
            ctx.font = "14px Arial"
            ctx.fillStyle = "#f60"
            ctx.fillRect(125, 1, 62, 20)
            ctx.fillStyle = "#069"
            ctx.fillText("Device fingerprint", 2, 15)
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)"
            ctx.fillText("Security check", 4, 35)

            return canvas.toDataURL()
        } catch {
            return ""
        }
    }

    // Get WebGL fingerprint
    private getWebGLFingerprint(): string {
        try {
            const canvas = document.createElement("canvas")
            const gl = canvas.getContext("webgl") as WebGLRenderingContext | null
                || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null
            if (!gl) return ""

            const debugInfo = gl.getExtension("WEBGL_debug_renderer_info") as WEBGL_debug_renderer_info | null
            if (!debugInfo) return ""

            const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

            return `${vendor}~${renderer}`
        } catch {
            return ""
        }
    }

    // Get available fonts
    private getAvailableFonts(): string[] {
        const testFonts = [
            "Arial",
            "Helvetica",
            "Times New Roman",
            "Courier New",
            "Verdana",
            "Georgia",
            "Palatino",
            "Garamond",
            "Bookman",
            "Comic Sans MS",
            "Trebuchet MS",
            "Arial Black",
            "Impact",
        ]

        return testFonts.filter((font) => this.isFontAvailable(font))
    }

    // Check if font is available
    private isFontAvailable(font: string): boolean {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) return false

        const text = "mmmmmmmmmmlli"
        ctx.font = "72px monospace"
        const baselineWidth = ctx.measureText(text).width

        ctx.font = `72px ${font}, monospace`
        const testWidth = ctx.measureText(text).width

        return baselineWidth !== testWidth
    }

    // Get plugin list
    private getPluginList(): string[] {
        return Array.from(navigator.plugins).map((plugin) => plugin.name)
    }

    // Detect automation/bot indicators
    private detectAutomation(fingerprint: DeviceFingerprint): boolean {
        const indicators = [
            // Headless browser indicators
            !fingerprint.canvas || fingerprint.canvas.length < 100,
            !fingerprint.webgl,
            fingerprint.plugins?.length === 0,

            // Common automation user agents
            /headless/i.test(fingerprint.userAgent),
            /phantom/i.test(fingerprint.userAgent),
            /selenium/i.test(fingerprint.userAgent),
            /webdriver/i.test(fingerprint.userAgent),

            // Suspicious screen resolutions
            fingerprint.screen === "1024x768x24" || fingerprint.screen === "1920x1080x24",
        ]

        return indicators.filter(Boolean).length >= 2
    }

    // Detect VPN/Proxy usage
    private detectVPN(fingerprint: DeviceFingerprint): boolean {
        // This would typically involve IP geolocation and known VPN detection
        // For now, we'll use basic heuristics

        const suspiciousTimezones = ["UTC", "GMT", "Europe/London", "America/New_York"]

        const commonVPNUserAgents = [/nordvpn/i, /expressvpn/i, /surfshark/i, /cyberghost/i]

        return (
            suspiciousTimezones.includes(fingerprint.timezone) ||
            commonVPNUserAgents.some((pattern) => pattern.test(fingerprint.userAgent))
        )
    }

    // Detect device inconsistencies
    private detectInconsistencies(current: DeviceFingerprint, known: DeviceFingerprint): boolean {
        const inconsistencies = [
            current.platform !== known.platform,
            current.language !== known.language,
            current.timezone !== known.timezone,
            Math.abs(current.createdAt - known.createdAt) > 86400000 && // More than 24 hours apart
            current.screen !== known.screen,
        ]

        return inconsistencies.filter(Boolean).length >= 2
    }

    // Simple hash function
    private simpleHash(str: string): string {
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = (hash << 5) - hash + char
            hash = hash & hash // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36)
    }
}

export const deviceFingerprint = new DeviceFingerprintManager()
export { DeviceFingerprintManager }
export type { DeviceFingerprint, DeviceRisk }
