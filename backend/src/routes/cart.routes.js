const express = require("express");
const { addToCart, updateCartItem, removeCartItem, getCart, applyCoupon, removeCoupon } = require("../controllers/cart.controller");
//const { protect } = require("../middlewares/auth.middleware");
const { protectOptional } = require("../middlewares/optionalAuth.middleware");
const { protect } = require("../middlewares/auth.middleware"); // auth protect



const router = express.Router();

// // guest + user add to cart
// router.post("/", protectOptional, addToCart);

router.post("/add", protect, addToCart);

// update cart item quantity
router.put("/:id", protectOptional, updateCartItem);
// get cart items
router.get("/", protectOptional, getCart);

router.post("/apply-coupon", protect, applyCoupon);

router.delete("/remove-coupon", protect, removeCoupon);

router.delete("/:id", protect, removeCartItem)






module.exports = router;
