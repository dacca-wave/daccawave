const express = require("express");
const {
    signup,
    login,
    verifyByOTP,
    verifyByLink,
    resendOTP,
    forgotPassword,
    resetPassword
} = require("../controllers/auth.controller");


//dummy route
const { protect } = require("../middlewares/auth.middleware");
const { adminOnly } = require("../middlewares/auth.middleware"); // admin middleware

const { otpLimiter } = require("../middlewares/rateLimit.middleware");







const router = express.Router();

router.post("/signup", signup); // signup route
router.post("/login", login);   // login route


//dummy route
router.get("/profile", protect, (req, res) => {
    res.json({
        message: "User profile accessed",
        user: req.user
    });
});


// admin only test route
router.get("/admin", protect, adminOnly, (req, res) => {
    res.json({
        message: "Admin route accessed",
        user: req.user
    });
});




// user-only demo route
router.get("/user-demo", protect, (req, res) => {
    res.json({ message: "User demo route working" });
});

// admin-only demo route
router.get("/admin-demo", protect, adminOnly, (req, res) => {
    res.json({ message: "Admin demo route working" });
});


router.post("/verify-otp", verifyByOTP);   // OTP verify
router.get("/verify", verifyByLink);       // link verify
router.post("/resend-otp", resendOTP);      // Resend OTP

router.post("/verify-otp", otpLimiter, verifyByOTP);
router.post("/resend-otp", otpLimiter, resendOTP);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);




module.exports = router;
