const prisma = require("../config/db"); // prisma client

// admin: add product variant
const addVariant = async (req, res) => {
    try {
        const { productId, size, color, stock } = req.body;

        // validation
        if (!productId || !size || !color || stock === undefined) {
            return res.status(400).json({ message: "All fields required" });
        }

        // check product exists & active
        const product = await prisma.product.findFirst({
            where: { id: productId, isActive: true }
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // prevent duplicate variant (same product + size + color)
        const exists = await prisma.productVariant.findFirst({
            where: {
                productId,
                size,
                color
            }
        });

        if (exists) {
            return res.status(409).json({
                message: "Variant already exists for this product"
            });
        }

        // create variant
        const variant = await prisma.productVariant.create({
            data: {
                productId,
                size,
                color,
                stock: Number(stock)
            }
        });

        return res.status(201).json({
            message: "Variant added successfully",
            variant
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};



// admin: update variant stock
const updateVariantStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        // validation
        if (stock === undefined) {
            return res.status(400).json({ message: "Stock value required" });
        }

        // find variant
        const variant = await prisma.productVariant.findUnique({
            where: { id: Number(id) }
        });

        if (!variant) {
            return res.status(404).json({ message: "Variant not found" });
        }
        if (stock < 0) {
            return res.status(400).json({
                message: "Stock cannot be negative"
            });
        }




        // update stock
        const updated = await prisma.productVariant.update({
            where: { id: Number(id) },
            data: { stock: Number(stock) }
        });

        return res.status(200).json({
            message: "Stock updated",
            variant: updated,
            lowStock: updated.stock < 5 // low stock alert flag
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ================= GET SINGLE VARIANT =================
const getSingleVariant = async (req, res) => {
    try {

        const { id } = req.params

        const variant = await prisma.productVariant.findUnique({
            where: { id: Number(id) },
            include: {
                product: true
            }
        })

        if (!variant) {
            return res.status(404).json({ message: "Variant not found" })
        }

        return res.status(200).json(variant)

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Server error" })
    }
}





module.exports = {
    addVariant,
    getSingleVariant,
    updateVariantStock
};

