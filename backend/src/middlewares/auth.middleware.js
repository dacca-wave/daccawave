const jwt = require("jsonwebtoken"); // JWT import

// user authentication middleware
const protect = (req, res, next) => {
    let token;

    // check authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1]; // extract token
    }

    // token not found
    if (!token) {
        return res.status(401).json({ message: "Not authorized, token missing" });
    }

    try {
        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; // attach user info to request
        next(); // go to next middleware/controller
    } catch (error) {
        return res.status(401).json({ message: "Not authorized, token invalid" });
    }
};



// admin authorization middleware
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "ADMIN") {
        next(); // admin allowed
    } else {
        return res.status(403).json({ message: "Admin access only" });
    }
};




module.exports = {
    protect,
    adminOnly
};


