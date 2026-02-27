const prisma = require("../config/db");

// ======================= ADD REVIEW =======================
const addReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, rating, comment } = req.body;

        // basic validation
        if (!productId || !rating) {
            return res.status(400).json({ message: "Product and rating required" });
        }

        // rating range check
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // check if user purchased this product
        const purchased = await prisma.orderItem.findFirst({
            where: {
                order: {
                    userId,
                    status: "DELIVERED"
                },
                variant: {
                    productId: Number(productId)
                }
            }
        });

        if (!purchased) {
            return res.status(403).json({
                message: "You can review only purchased products"
            });
        }

        // check existing review
        const existingReview = await prisma.review.findFirst({
            where: {
                userId,
                productId: Number(productId)
            }
        });

        if (existingReview) {
            return res.status(409).json({
                message: "You already reviewed this product"
            });
        }

        // create review
        const review = await prisma.review.create({
            data: {
                userId,
                productId: Number(productId),
                rating,
                comment
            }
        });

        return res.status(201).json({
            message: "Review added successfully",
            review
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ======================= GET PRODUCT REVIEWS =======================
const getProductReviews = async (req, res) => {
    try {
        const productId = Number(req.params.productId);

        if (!productId) {
            return res.status(400).json({ message: "Product ID required" });
        }

        const reviews = await prisma.review.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json(reviews);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};



// ======================= PRODUCT RATING SUMMARY =======================
const getProductRatingSummary = async (req, res) => {
    try {
        const productId = Number(req.params.productId);

        if (!productId) {
            return res.status(400).json({ message: "Product ID required" });
        }

        // get all ratings only
        const reviews = await prisma.review.findMany({
            where: { productId },
            select: { rating: true }
        });

        const totalReviews = reviews.length;

        if (totalReviews === 0) {
            return res.status(200).json({
                averageRating: 0,
                totalReviews: 0,
                ratingBreakdown: {
                    5: 0,
                    4: 0,
                    3: 0,
                    2: 0,
                    1: 0
                }
            });
        }

        // calculate rating sum
        const ratingSum = reviews.reduce(
            (sum, r) => sum + r.rating,
            0
        );

        const averageRating = Number(
            (ratingSum / totalReviews).toFixed(1)
        );

        // calculate breakdown
        const ratingBreakdown = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        };

        reviews.forEach(r => {
            ratingBreakdown[r.rating] += 1;
        });

        return res.status(200).json({
            averageRating,
            totalReviews,
            ratingBreakdown
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};




// ======================= UPDATE REVIEW =======================
const updateReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviewId = Number(req.params.id);
        const { rating, comment } = req.body;

        // rating validation
        if (rating && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // ownership check
        if (review.userId !== userId) {
            return res.status(403).json({
                message: "You can update only your own review"
            });
        }

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                rating: rating ?? review.rating,
                comment: comment ?? review.comment
            }
        });

        return res.json({
            message: "Review updated successfully",
            review: updatedReview
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};



// ======================= DELETE REVIEW =======================
const deleteReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const reviewId = Number(req.params.id);

        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        // ownership check
        if (review.userId !== userId) {
            return res.status(403).json({
                message: "You can delete only your own review"
            });
        }

        await prisma.review.delete({
            where: { id: reviewId }
        });

        return res.json({
            message: "Review deleted successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};



module.exports = {
    addReview,
    getProductReviews,
    getProductRatingSummary,
    updateReview,
    deleteReview
};
