const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const variantRoutes = require("./routes/variant.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");
const testRoutes = require("./routes/test.routes");
const couponRoutes = require("./routes/coupon.routes");
const paymentRoutes = require("./routes/payment.routes");
const refundRoutes = require("./routes/refund.routes");
const reviewRoutes = require("./routes/review.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// ================= CORS =================
app.use(cors({
    origin: "http://localhost:5173"
}));

// ================= STRIPE WEBHOOK FIRST =================
// ⚠️ Must be BEFORE express.json()
app.use(
    "/api/payments/webhook",
    express.raw({ type: "application/json" })
);

// ================= JSON PARSER =================
app.use(express.json());

// ================= ROUTES =================
app.get("/", (req, res) => {
    res.send("Dacca Wave Backend Running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/test", testRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/refunds", refundRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

// ================= STATIC FILES =================
app.use("/uploads", express.static("uploads"));

module.exports = app;
