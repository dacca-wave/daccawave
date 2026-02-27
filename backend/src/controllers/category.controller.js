const prisma = require("../config/db"); // prisma client

// admin: add category
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // validation
        if (!name) {
            return res.status(400).json({ message: "Category name required" });
        }

        // check duplicate
        const exists = await prisma.category.findUnique({
            where: { name }
        });

        if (exists) {
            return res.status(409).json({ message: "Category already exists" });
        }

        // create category
        const category = await prisma.category.create({
            data: { name }
        });

        return res.status(201).json({
            message: "Category created",
            category
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

// public: list categories
const getCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { isActive: true }, // only active categories
            orderBy: { name: "asc" }
        });

        return res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// admin: soft delete category
const deactivateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id: Number(id) }
        });

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        await prisma.category.update({
            where: { id: Number(id) },
            data: { isActive: false }
        });

        return res.status(200).json({
            message: "Category deactivated successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    addCategory,
    getCategories,
    deactivateCategory
};
