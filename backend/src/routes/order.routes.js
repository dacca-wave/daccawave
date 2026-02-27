const express = require("express");
const {
    placeOrderCOD,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} = require("../controllers/order.controller");

const { protect, adminOnly } = require("../middlewares/auth.middleware");



const router = express.Router();

// place COD order (login required)
router.post("/cod", protect, placeOrderCOD);
// get logged-in user's orders
router.get("/my", protect, getMyOrders);

// admin: get all orders
router.get("/", protect, adminOnly, getAllOrders);

// admin: update order status
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

// cancel order (user)
router.put("/:id/cancel", protect, cancelOrder);



module.exports = router;
