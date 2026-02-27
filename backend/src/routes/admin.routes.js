const express = require("express");
const router = express.Router();

const {
    getDashboardOverview,
    getLowStockVariants,
    getMonthlyAnalytics,
    getRecentOrders
} = require("../controllers/admin.controller");

const { protect, adminOnly } = require("../middlewares/auth.middleware");

// dashboard overview
router.get(
    "/dashboard",
    protect,
    adminOnly,
    getDashboardOverview
);

// low stock alert
router.get(
    "/low-stock",
    protect,
    adminOnly,
    getLowStockVariants
);

// monthly analytics (chart-ready)
router.get(
    "/analytics/monthly",
    protect,
    adminOnly,
    getMonthlyAnalytics
);

// recent orders
router.get(
    "/orders/recent",
    protect,
    adminOnly,
    getRecentOrders
);




module.exports = router;
