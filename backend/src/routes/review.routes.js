const express = require("express");
const router = express.Router();

const {
    addReview,
    getProductReviews,
    getProductRatingSummary,
    updateReview,
    deleteReview
} = require("../controllers/review.controller");


const { protect } = require("../middlewares/auth.middleware");

// add review
router.post("/", protect, addReview);

// get reviews by product
router.get("/product/:productId", getProductReviews);

// product rating summary
router.get("/product/:productId/summary", getProductRatingSummary);

// update review
router.put("/:id", protect, updateReview);

// delete review
router.delete("/:id", protect, deleteReview);


module.exports = router;
