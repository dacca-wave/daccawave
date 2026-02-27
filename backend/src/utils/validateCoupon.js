const prisma = require("../config/db");

// validate coupon against cart + user
const validateCoupon = async ({ code, cart, user }) => {
    // fetch coupon with conditions
    const coupon = await prisma.coupon.findUnique({
        where: { code },
        include: { conditions: true }
    });

    if (!coupon || !coupon.isActive) {
        return { valid: false, message: "Invalid coupon" };
    }

    // expiry check
    if (coupon.expiresAt < new Date()) {
        return { valid: false, message: "Coupon expired" };
    }

    // min order check
    if (coupon.minOrderAmount && cart.total < coupon.minOrderAmount) {
        return {
            valid: false,
            message: `Minimum order ৳${coupon.minOrderAmount} required`
        };
    }

    // usage limit check
    if (
        coupon.totalUsageLimit &&
        coupon.usedCount >= coupon.totalUsageLimit
    ) {
        return { valid: false, message: "Coupon usage limit reached" };
    }

    // ===== dynamic conditions =====
    for (const cond of coupon.conditions) {
        const values = JSON.parse(cond.value);

        // CATEGORY condition
        if (cond.type === "CATEGORY") {
            const cartCategoryIds = cart.items.map(
                (i) => i.variant.product.categoryId
            );

            const match = cartCategoryIds.some((id) => values.includes(id));
            if (cond.operator === "IN" && !match) {
                return { valid: false, message: "Coupon not applicable for category" };
            }
        }

        // PRODUCT condition
        if (cond.type === "PRODUCT") {
            const cartProductIds = cart.items.map(
                (i) => i.variant.product.id
            );

            const match = cartProductIds.some((id) => values.includes(id));
            if (cond.operator === "IN" && !match) {
                return { valid: false, message: "Coupon not applicable for product" };
            }
        }

        // FIRST_ORDER condition
        if (cond.type === "FIRST_ORDER") {
            const orderCount = await prisma.order.count({
                where: { userId: user.id }
            });

            if (values === true && orderCount > 0) {
                return { valid: false, message: "Only for first order" };
            }
        }
    }

    // ===== discount calculation =====
    let discount = 0;

    if (coupon.discountType === "PERCENT") {
        discount = (cart.total * coupon.discountValue) / 100;
    } else {
        discount = coupon.discountValue;
    }

    // max discount cap
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
    }

    return {
        valid: true,
        coupon,
        discount
    };
};

module.exports = { validateCoupon };
