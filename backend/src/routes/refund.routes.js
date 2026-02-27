const express = require("express");
const {
    createRefundRequest,
    getAllRefundRequests,
    approveRefund,
    rejectRefund,
    getMyRefundRequests
} = require("../controllers/refund.controller");

const { protect, adminOnly } = require("../middlewares/auth.middleware");
const refundUpload = require("../middlewares/refundUpload.middleware");

const router = express.Router();

// ================= USER: REFUND REQUEST =================
router.post(
    "/request",
    protect,
    refundUpload.single("image"),
    createRefundRequest
);

// ================= ADMIN: VIEW REFUND REQUESTS =================
router.get(
    "/",
    protect,
    adminOnly,
    getAllRefundRequests
);


// admin approve refund
router.put(
    "/:id/approve",
    protect,
    adminOnly,
    approveRefund
);

// admin reject refund
router.put(
    "/:id/reject",
    protect,
    adminOnly,
    rejectRefund
);


// user refund history
router.get(
    "/my",
    protect,
    getMyRefundRequests
);



module.exports = router;
