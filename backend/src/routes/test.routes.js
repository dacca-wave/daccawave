const express = require("express");
const { sendEmail } = require("../config/email");

const router = express.Router();

// test email route
router.get("/email", async (req, res) => {
    try {
        await sendEmail({
            to: process.env.EMAIL_USER, // send to self
            subject: "Dacca Wave Test Email",
            html: "<h2>Email system working 🎉</h2>"
        });

        res.json({ message: "Test email sent" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Email failed" });
    }
});

module.exports = router;
