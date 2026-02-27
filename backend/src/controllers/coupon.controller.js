const prisma = require("../config/db");

// admin: create coupon with multiple conditions
const createCoupon = async (req, res) => {
    try {
        const {
            code,
            discountType,
            discountValue,
            maxDiscount,
            minOrderAmount,
            expiresAt,
            isStackable,
            conditions
        } = req.body;

        // basic validation
        // if (!code || !discountType || !discountValue || !expiresAt) {
        //     return res.status(400).json({ message: "Required fields missing" });
        // }

        //Coupon Validation Hardening
        if (discountValue <= 0) {
            return res.status(400).json({
                message: "Discount must be greater than zero"
            });
        }


        // check duplicate code
        const existing = await prisma.coupon.findUnique({
            where: { code }
        });

        if (existing) {
            return res.status(409).json({ message: "Coupon code already exists" });
        }

        //expiry check
        if (new Date(expiresAt) <= new Date()) {
            return res.status(400).json({
                message: "Expiry date must be in the future"
            });
        }


        // create coupon + conditions
        const coupon = await prisma.coupon.create({
            data: {
                code,
                discountType,
                discountValue,
                maxDiscount,
                minOrderAmount,
                expiresAt: new Date(expiresAt),
                isStackable: Boolean(isStackable),

                // save dynamic conditions
                conditions: {
                    create: conditions?.map((cond) => ({
                        type: cond.type,
                        operator: cond.operator,
                        value: JSON.stringify(cond.value) // store JSON as string
                    }))
                }
            },
            include: { conditions: true }
        });

        return res.status(201).json({
            message: "Coupon created successfully",
            coupon
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// admin: soft delete coupon
const deactivateCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await prisma.coupon.findUnique({
            where: { id: Number(id) }
        });

        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        await prisma.coupon.update({
            where: { id: Number(id) },
            data: { isActive: false }
        });

        return res.status(200).json({
            message: "Coupon deactivated successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    createCoupon,
    deactivateCoupon
};
