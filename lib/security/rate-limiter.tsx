interface RateLimitConfig {
    windowMs: number
    maxAttempts: number
    blockDurationMs: number
    progressiveDelay: boolean
}

interface AttemptRecord {
    count: number
    firstAttempt: number
    lastAttempt: number
    blocked: boolean
    blockExpires?: number
}

interface SecurityMetrics {
    totalAttempts: number
    failedAttempts: number
    blockedAttempts: number
    suspiciousActivity: number
    lastActivity: number
}

class AdvancedRateLimiter {
    private attempts = new Map<string, AttemptRecord>()
    private securityMetrics = new Map<string, SecurityMetrics>()
    private suspiciousIPs = new Set<string>()
    private globalConfig: RateLimitConfig

    constructor(config: RateLimitConfig) {
        this.globalConfig = config
        this.startCleanupInterval()
    }

    // Check if request is allowed
    isAllowed(identifier: string, ip?: string): { allowed: boolean; retryAfter?: number; reason?: string } {
        const now = Date.now()

        // Check IP-based blocking
        if (ip && this.suspiciousIPs.has(ip)) {
            return { allowed: false, reason: "IP_BLOCKED" }
        }

        const record = this.attempts.get(identifier) || {
            count: 0,
            firstAttempt: now,
            lastAttempt: now,
            blocked: false,
        }

        // Check if currently blocked
        if (record.blocked && record.blockExpires && now < record.blockExpires) {
            return {
                allowed: false,
                retryAfter: Math.ceil((record.blockExpires - now) / 1000),
                reason: "RATE_LIMITED",
            }
        }

        // Reset if window expired
        if (now - record.firstAttempt > this.globalConfig.windowMs) {
            record.count = 0
            record.firstAttempt = now
            record.blocked = false
            record.blockExpires = undefined
        }

        // Check rate limit
        if (record.count >= this.globalConfig.maxAttempts) {
            const blockDuration = this.calculateBlockDuration(record.count)
            record.blocked = true
            record.blockExpires = now + blockDuration

            this.attempts.set(identifier, record)
            this.updateSecurityMetrics(identifier, "blocked")

            return {
                allowed: false,
                retryAfter: Math.ceil(blockDuration / 1000),
                reason: "RATE_LIMITED",
            }
        }

        return { allowed: true }
    }

    // Record an attempt
    recordAttempt(identifier: string, success: boolean, ip?: string): void {
        const now = Date.now()
        const record = this.attempts.get(identifier) || {
            count: 0,
            firstAttempt: now,
            lastAttempt: now,
            blocked: false,
        }

        record.count++
        record.lastAttempt = now
        this.attempts.set(identifier, record)

        // Update security metrics
        this.updateSecurityMetrics(identifier, success ? "success" : "failed")

        // Detect suspicious activity
        if (!success) {
            this.detectSuspiciousActivity(identifier, ip)
        }

        // Reset on success
        if (success) {
            this.resetAttempts(identifier)
        }
    }

    // Calculate progressive block duration
    private calculateBlockDuration(attemptCount: number): number {
        if (!this.globalConfig.progressiveDelay) {
            return this.globalConfig.blockDurationMs
        }

        // Progressive delay: 1min, 5min, 15min, 1hr, 24hr
        const delays = [60000, 300000, 900000, 3600000, 86400000]
        const index = Math.min(attemptCount - this.globalConfig.maxAttempts, delays.length - 1)
        return delays[index]
    }

    // Update security metrics
    private updateSecurityMetrics(identifier: string, type: "success" | "failed" | "blocked"): void {
        const metrics = this.securityMetrics.get(identifier) || {
            totalAttempts: 0,
            failedAttempts: 0,
            blockedAttempts: 0,
            suspiciousActivity: 0,
            lastActivity: Date.now(),
        }

        metrics.totalAttempts++
        metrics.lastActivity = Date.now()

        switch (type) {
            case "failed":
                metrics.failedAttempts++
                break
            case "blocked":
                metrics.blockedAttempts++
                break
        }

        this.securityMetrics.set(identifier, metrics)
    }

    // Detect suspicious activity patterns
    private detectSuspiciousActivity(identifier: string, ip?: string): void {
        const record = this.attempts.get(identifier)
        const metrics = this.securityMetrics.get(identifier)

        if (!record || !metrics) return

        // Pattern 1: Rapid successive attempts
        const rapidAttempts = record.count > 3 && Date.now() - record.firstAttempt < 30000

        // Pattern 2: High failure rate
        const highFailureRate = metrics.failedAttempts > 10 && metrics.failedAttempts / metrics.totalAttempts > 0.8

        // Pattern 3: Multiple identifiers from same IP
        const multipleIdentifiers = ip && this.countIdentifiersForIP(ip) > 5

        if (rapidAttempts || highFailureRate || multipleIdentifiers) {
            metrics.suspiciousActivity++

            // Block IP if very suspicious
            if (ip && metrics.suspiciousActivity > 3) {
                this.suspiciousIPs.add(ip)
                this.logSecurityEvent("IP_BLOCKED", { ip, identifier, reason: "suspicious_activity" })
            }

            this.logSecurityEvent("SUSPICIOUS_ACTIVITY", {
                identifier,
                ip,
                patterns: { rapidAttempts, highFailureRate, multipleIdentifiers },
            })
        }
    }

    // Count identifiers for an IP
    private countIdentifiersForIP(ip: string): number {
        // This would typically be stored in a database
        // For now, we'll use a simple in-memory approach
        return Array.from(this.attempts.keys()).filter(
            (key) => key.includes(ip), // Simplified check
        ).length
    }

    // Reset attempts for identifier
    resetAttempts(identifier: string): void {
        this.attempts.delete(identifier)
    }

    // Get security status
    getSecurityStatus(identifier: string): {
        isBlocked: boolean
        attemptsRemaining: number
        nextResetTime: number
        riskLevel: "low" | "medium" | "high"
        requiresCaptcha: boolean
    } {
        const record = this.attempts.get(identifier)
        const metrics = this.securityMetrics.get(identifier)

        if (!record) {
            return {
                isBlocked: false,
                attemptsRemaining: this.globalConfig.maxAttempts,
                nextResetTime: Date.now() + this.globalConfig.windowMs,
                riskLevel: "low",
                requiresCaptcha: false,
            }
        }

        const attemptsRemaining = Math.max(0, this.globalConfig.maxAttempts - record.count)
        const riskLevel = this.calculateRiskLevel(record, metrics)

        return {
            isBlocked: record.blocked || false,
            attemptsRemaining,
            nextResetTime: record.firstAttempt + this.globalConfig.windowMs,
            riskLevel,
            requiresCaptcha: riskLevel === "high" || attemptsRemaining <= 2,
        }
    }

    // Calculate risk level
    private calculateRiskLevel(record: AttemptRecord, metrics?: SecurityMetrics): "low" | "medium" | "high" {
        if (!metrics) return "low"

        const failureRate = metrics.failedAttempts / metrics.totalAttempts
        const recentActivity = Date.now() - metrics.lastActivity < 300000 // 5 minutes

        if (metrics.suspiciousActivity > 2 || failureRate > 0.7) return "high"
        if (metrics.suspiciousActivity > 0 || failureRate > 0.5 || recentActivity) return "medium"

        return "low"
    }

    // Log security events
    private logSecurityEvent(event: string, data: any): void {
        console.log(`[SECURITY] ${event}:`, {
            timestamp: new Date().toISOString(),
            ...data,
        })

        // In production, send to security monitoring service
        // await securityLogger.log(event, data)
    }

    // Cleanup expired records
    private startCleanupInterval(): void {
        setInterval(() => {
            const now = Date.now()

            // Clean up expired attempts
            for (const [key, record] of this.attempts.entries()) {
                if (now - record.lastAttempt > this.globalConfig.windowMs * 2) {
                    this.attempts.delete(key)
                }
            }

            // Clean up old metrics
            for (const [key, metrics] of this.securityMetrics.entries()) {
                if (now - metrics.lastActivity > 86400000) {
                    // 24 hours
                    this.securityMetrics.delete(key)
                }
            }
        }, 300000) // Clean every 5 minutes
    }
}

// Export singleton instance
export const rateLimiter = new AdvancedRateLimiter({
    windowMs: 900000, // 15 minutes
    maxAttempts: 5,
    blockDurationMs: 300000, // 5 minutes initial block
    progressiveDelay: true,
})

export { AdvancedRateLimiter }
export type { RateLimitConfig, SecurityMetrics }
