interface CaptchaChallenge {
    id: string
    type: "math" | "image" | "text" | "slider"
    question: string
    answer: string
    options?: string[]
    imageUrl?: string
    difficulty: "easy" | "medium" | "hard"
    createdAt: number
    expiresAt: number
}

interface CaptchaResult {
    success: boolean
    challengeId: string
    score: number
    timeToSolve: number
}

class CaptchaManager {
    private activeChallenges = new Map<string, CaptchaChallenge>()
    private solveAttempts = new Map<string, number>()

    // Generate CAPTCHA challenge
    generateChallenge(difficulty: "easy" | "medium" | "hard" = "medium"): CaptchaChallenge {
        const challengeId = this.generateId()
        const type = this.selectChallengeType(difficulty)

        let challenge: CaptchaChallenge

        switch (type) {
            case "math":
                challenge = this.generateMathChallenge(challengeId, difficulty)
                break
            case "text":
                challenge = this.generateTextChallenge(challengeId, difficulty)
                break
            case "slider":
                challenge = this.generateSliderChallenge(challengeId, difficulty)
                break
            default:
                challenge = this.generateMathChallenge(challengeId, difficulty)
        }

        this.activeChallenges.set(challengeId, challenge)

        // Auto-cleanup after expiration
        setTimeout(() => {
            this.activeChallenges.delete(challengeId)
            this.solveAttempts.delete(challengeId)
        }, challenge.expiresAt - Date.now())

        return challenge
    }

    // Verify CAPTCHA solution
    verifySolution(challengeId: string, userAnswer: string, startTime: number): CaptchaResult {
        const challenge = this.activeChallenges.get(challengeId)
        const attempts = this.solveAttempts.get(challengeId) || 0

        if (!challenge) {
            return {
                success: false,
                challengeId,
                score: 0,
                timeToSolve: 0,
            }
        }

        // Check expiration
        if (Date.now() > challenge.expiresAt) {
            this.activeChallenges.delete(challengeId)
            return {
                success: false,
                challengeId,
                score: 0,
                timeToSolve: 0,
            }
        }

        // Increment attempts
        this.solveAttempts.set(challengeId, attempts + 1)

        // Check max attempts
        if (attempts >= 3) {
            this.activeChallenges.delete(challengeId)
            return {
                success: false,
                challengeId,
                score: 0,
                timeToSolve: 0,
            }
        }

        const timeToSolve = Date.now() - startTime
        const isCorrect = this.checkAnswer(challenge, userAnswer)
        const score = this.calculateScore(challenge, timeToSolve, attempts, isCorrect)

        if (isCorrect) {
            this.activeChallenges.delete(challengeId)
            this.solveAttempts.delete(challengeId)
        }

        return {
            success: isCorrect,
            challengeId,
            score,
            timeToSolve,
        }
    }

    // Generate math challenge
    private generateMathChallenge(id: string, difficulty: "easy" | "medium" | "hard"): CaptchaChallenge {
        let question: string
        let answer: string

        switch (difficulty) {
            case "easy":
                const a = Math.floor(Math.random() * 10) + 1
                const b = Math.floor(Math.random() * 10) + 1
                question = `What is ${a} + ${b}?`
                answer = (a + b).toString()
                break

            case "medium":
                const x = Math.floor(Math.random() * 20) + 1
                const y = Math.floor(Math.random() * 20) + 1
                const op = Math.random() > 0.5 ? "+" : "-"
                if (op === "+") {
                    question = `What is ${x} + ${y}?`
                    answer = (x + y).toString()
                } else {
                    question = `What is ${Math.max(x, y)} - ${Math.min(x, y)}?`
                    answer = (Math.max(x, y) - Math.min(x, y)).toString()
                }
                break

            case "hard":
                const m = Math.floor(Math.random() * 12) + 2
                const n = Math.floor(Math.random() * 12) + 2
                question = `What is ${m} × ${n}?`
                answer = (m * n).toString()
                break
        }

        return {
            id,
            type: "math",
            question,
            answer,
            difficulty,
            createdAt: Date.now(),
            expiresAt: Date.now() + 300000, // 5 minutes
        }
    }

    // Generate text challenge
    private generateTextChallenge(id: string, difficulty: "easy" | "medium" | "hard"): CaptchaChallenge {
        const words = {
            easy: ["cat", "dog", "sun", "car", "book"],
            medium: ["computer", "security", "challenge", "verification"],
            hard: ["authentication", "cryptography", "cybersecurity", "verification"],
        }

        const wordList = words[difficulty]
        const word = wordList[Math.floor(Math.random() * wordList.length)]

        return {
            id,
            type: "text",
            question: `Type the word: ${word.toUpperCase()}`,
            answer: word.toLowerCase(),
            difficulty,
            createdAt: Date.now(),
            expiresAt: Date.now() + 300000,
        }
    }

    // Generate slider challenge
    private generateSliderChallenge(id: string, difficulty: "easy" | "medium" | "hard"): CaptchaChallenge {
        const target = Math.floor(Math.random() * 100) + 1
        const tolerance = difficulty === "easy" ? 10 : difficulty === "medium" ? 5 : 2

        return {
            id,
            type: "slider",
            question: `Move the slider to ${target}`,
            answer: `${target}±${tolerance}`,
            difficulty,
            createdAt: Date.now(),
            expiresAt: Date.now() + 300000,
        }
    }

    // Select challenge type based on difficulty
    private selectChallengeType(difficulty: "easy" | "medium" | "hard"): "math" | "text" | "slider" {
        // Example: weight challenge type probabilities based on difficulty
        let types: ("math" | "text" | "slider")[]
        switch (difficulty) {
            case "easy":
                types = ["math", "text"]
                break
            case "medium":
                types = ["math", "text", "slider"]
                break
            case "hard":
                types = ["text", "slider"]
                break
            default:
                types = ["math", "text", "slider"]
        }
        return types[Math.floor(Math.random() * types.length)]
    }

    // Check if answer is correct
    private checkAnswer(challenge: CaptchaChallenge, userAnswer: string): boolean {
        switch (challenge.type) {
            case "math":
            case "text":
                return userAnswer.toLowerCase().trim() === challenge.answer.toLowerCase()

            case "slider":
                const [target, tolerance] = challenge.answer.split("±").map(Number)
                const userValue = Number.parseInt(userAnswer)
                return Math.abs(userValue - target) <= tolerance

            default:
                return false
        }
    }

    // Calculate score based on performance
    private calculateScore(
        challenge: CaptchaChallenge,
        timeToSolve: number,
        attempts: number,
        isCorrect: boolean,
    ): number {
        if (!isCorrect) return 0

        let score = 100

        // Deduct points for multiple attempts
        score -= (attempts - 1) * 20

        // Deduct points for slow solving (over 30 seconds)
        if (timeToSolve > 30000) {
            score -= Math.min(30, (timeToSolve - 30000) / 1000)
        }

        // Bonus for quick solving (under 10 seconds)
        if (timeToSolve < 10000) {
            score += 10
        }

        // Difficulty bonus
        const difficultyBonus = {
            easy: 0,
            medium: 5,
            hard: 10,
        }
        score += difficultyBonus[challenge.difficulty]

        return Math.max(0, Math.min(100, score))
    }

    // Generate unique ID
    private generateId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36)
    }

    // Get challenge statistics
    getChallengeStats(): {
        activeChallenges: number
        totalAttempts: number
        averageScore: number
    } {
        const totalAttempts = Array.from(this.solveAttempts.values()).reduce((sum, attempts) => sum + attempts, 0)

        return {
            activeChallenges: this.activeChallenges.size,
            totalAttempts,
            averageScore: 0, // Would calculate from stored results in production
        }
    }
}

export const captchaManager = new CaptchaManager()
export { CaptchaManager }
export type { CaptchaChallenge, CaptchaResult }
