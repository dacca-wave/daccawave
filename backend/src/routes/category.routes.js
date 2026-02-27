const express = require("express");
const { addCategory, getCategories } = require("../controllers/category.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const { deactivateCategory } = require("../controllers/category.controller"); // soft delete


const router = express.Router();

// admin add category
router.post("/", protect, adminOnly, addCategory);

// public get categories
router.get("/", getCategories);


//soft delete
router.patch(
    "/:id/deactivate",
    protect,
    adminOnly,
    deactivateCategory
);


module.exports = router;
