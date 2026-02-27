// payment.routes.js
// Stripe Payment Routes

const express = require("express");
const {
    createPaymentIntent,
    stripeWebhook
} = require("../controllers/payment.controller");

const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// ================= CREATE PAYMENT INTENT =================
// Auth required
router.post("/intent", protect, createPaymentIntent);

// ================= STRIPE WEBHOOK =================
// NO auth
router.post("/webhook", stripeWebhook);

module.exports = router;
