const prisma = require("../config/db"); // prisma client

// admin: add product
const addProduct = async (req, res) => {
    try {
        const { name, description, price, categoryId, imageUrl } = req.body;

        // // validation
        // if (!name || !description || !price || !categoryId) {
        //     return res.status(400).json({ message: "All required fields missing" });
        // }

        // validation hardening
        if (
            !name?.trim() ||
            !description?.trim() ||
            !categoryId ||
            Number(price) <= 0
        ) {
            return res.status(400).json({
                message: "Invalid product input"
            });
        }


        // ensure category exists & active
        const category = await prisma.category.findFirst({
            where: { id: categoryId, isActive: true }
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // create product
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: Number(price),
                categoryId,
                imageUrl
            }
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// admin: update product (name, price, description, image)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, imageUrl, categoryId } = req.body;

        // find product
        const product = await prisma.product.findUnique({
            where: { id: Number(id) }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // validation hardening
        if (price !== undefined && Number(price) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than zero"
            });
        }

        if (name !== undefined && !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product name cannot be empty"
            });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price: Number(price) }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(categoryId !== undefined && { categoryId })
            }
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};






// public: list active products (search + price + category + variant filter)
// public: list active products (final clean filter response)
// public: list active products (search + filter + sort + pagination)

const getProducts = async (req, res) => {
    try {

        const {
            search,
            minPrice,
            maxPrice,
            category,
            size,
            color,
            sort,
            page = 1,
            limit = 8
        } = req.query;

        const filters = {
            isActive: true
        };

        // ===== Sorting Logic =====
        let orderBy = { createdAt: "desc" };

        if (sort === "priceLow") {
            orderBy = { price: "asc" };
        }

        if (sort === "priceHigh") {
            orderBy = { price: "desc" };
        }

        if (sort === "newest") {
            orderBy = { createdAt: "desc" };
        }

        // ===== Search Filter =====
        if (search) {
            filters.name = {
                contains: search
            };
        }

        // ===== Price Filter =====
        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.gte = Number(minPrice);
            if (maxPrice) filters.price.lte = Number(maxPrice);
        }

        // ===== Category Filter (by name → id) =====
        if (category) {
            const categoryData = await prisma.category.findFirst({
                where: { name: category }
            });

            if (!categoryData) {
                return res.status(200).json({
                    success: true,
                    data: [],
                    pagination: {
                        total: 0,
                        page: Number(page),
                        limit: Number(limit),
                        totalPages: 0
                    }
                });
            }

            filters.categoryId = categoryData.id;
        }

        // ===== Variant Filter =====
        if (size || color) {
            filters.variants = {
                some: {
                    ...(size ? { size } : {}),
                    ...(color ? { color } : {}),
                    stock: { gt: 0 }
                }
            };
        }

        // ===== Pagination Calculation =====
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber;

        // ===== Total Count =====
        const totalProducts = await prisma.product.count({
            where: filters
        });

        // ===== Final Product Fetch =====
        const products = await prisma.product.findMany({
            where: filters,
            include: {
                category: true,
                variants: {
                    where: {
                        stock: { gt: 0 },
                        ...(size ? { size } : {}),
                        ...(color ? { color } : {})
                    }
                }
            },
            orderBy: orderBy,
            skip: skip,
            take: limitNumber
        });

        return res.status(200).json({
            success: true,
            data: products,
            pagination: {
                total: totalProducts,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalProducts / limitNumber)
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};







// public: get single product with variants
const getProductDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // find active product with variants
        const product = await prisma.product.findFirst({
            where: { id: Number(id), isActive: true },
            include: {
                category: true,           // include category
                variants: true            // include size/color variants
            }
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// admin: soft delete product (inactive)
const deactivateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id: Number(id) }
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await prisma.product.update({
            where: { id: Number(id) },
            data: { isActive: false }
        });

        return res.status(200).json({
            message: "Product deactivated successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ================= GET FILTER OPTIONS =================
// return unique categories, sizes & colors

const getProductFilters = async (req, res) => {
    try {

        // get active categories
        const categories = await prisma.category.findMany({
            where: { isActive: true },
            select: { name: true }
        })

        // get unique sizes
        const sizes = await prisma.productVariant.findMany({
            select: { size: true },
            distinct: ["size"]
        })

        // get unique colors
        const colors = await prisma.productVariant.findMany({
            select: { color: true },
            distinct: ["color"]
        })

        return res.status(200).json({
            success: true,
            data: {
                categories: categories.map(c => c.name),
                sizes: sizes.map(s => s.size),
                colors: colors.map(c => c.color)
            }
        })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Server error" })
    }
}


module.exports = {
    addProduct,
    updateProduct,
    getProducts,
    getProductDetails,
    deactivateProduct,
    getProductFilters
};

