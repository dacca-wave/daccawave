const rateLimit = require("express-rate-limit");

// OTP rate limiter
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // max 5 requests
    message: {
        message: "Too many OTP requests. Please try later."
    }
});

module.exports = { otpLimiter };
