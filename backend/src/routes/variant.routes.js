const express = require("express");
const { addVariant, updateVariantStock } = require("../controllers/variant.controller");
const { protect, adminOnly } = require("../middlewares/auth.middleware");
const { getSingleVariant } = require("../controllers/variant.controller")


const router = express.Router();

// admin add variant
router.post("/", protect, adminOnly, addVariant);
// admin update variant stock
router.put("/:id/stock", protect, adminOnly, updateVariantStock);

router.get("/:id", getSingleVariant)




module.exports = router;
