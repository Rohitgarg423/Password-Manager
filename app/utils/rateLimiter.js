import { RateLimiterMemory } from "rate-limiter-flexible"

// ✅ max 5 attempts per IP per 15 minutes
const rateLimiter = new RateLimiterMemory({
    points: 5,      // 5 attempts
    duration: 900   // per 15 minutes
})

export default rateLimiter