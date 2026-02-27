const express = require("express");
const {
    addProduct,
    updateProduct,
    getProducts,
    getProductDetails,
    deactivateProduct,
    getProductFilters
} = require("../controllers/product.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");



const router = express.Router();

// admin add product
router.post("/", protect, adminOnly, addProduct);

// admin: update product
router.put(
    "/:id",
    protect,
    adminOnly,
    updateProduct
);

// get filter options
router.get("/filters", getProductFilters)

// public get products
router.get("/", getProducts);

// public product details
router.get("/:id", getProductDetails);

// admin: soft delete product
router.patch(
    "/:id/deactivate",
    protect,
    adminOnly,
    deactivateProduct
);



module.exports = router;
