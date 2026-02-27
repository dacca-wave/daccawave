const jwt = require("jsonwebtoken"); // JWT import

// optional auth middleware (guest or user)
const protectOptional = (req, res, next) => {
    let token;

    // check authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    // if token exists → verify
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded; // attach user if logged in
        } catch (error) {
            // ignore invalid token (treat as guest)
            req.user = null;
        }
    }

    next(); // continue request
};

module.exports = { protectOptional };
