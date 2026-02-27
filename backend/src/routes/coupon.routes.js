const express = require("express");
const { createCoupon, deactivateCoupon } = require("../controllers/coupon.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");

const router = express.Router();

// admin create coupon
router.post("/", protect, adminOnly, createCoupon);


// admin: soft delete coupon
router.patch(
    "/:id/deactivate",
    protect,
    adminOnly,
    deactivateCoupon
);

module.exports = router;
