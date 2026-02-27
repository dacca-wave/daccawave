const prisma = require("../config/db");
const { validateCoupon } = require("../utils/validateCoupon");

// ======================= HELPER: RECALCULATE CART =======================
// Central calculation engine (used everywhere)
const recalculateCart = async (userId) => {

    const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    variant: {
                        include: { product: true }
                    }
                }
            }
        }
    });

    if (!cart) return null;

    // calculate total
    let totalAmount = 0;
    cart.items.forEach(item => {
        totalAmount += item.quantity * item.variant.product.price;
    });

    let discountAmount = 0;

    // if coupon exists → revalidate
    if (cart.couponCode) {
        const result = await validateCoupon({
            code: cart.couponCode,
            cart: {
                total: totalAmount,
                items: cart.items
            },
            user: { id: userId }
        });

        if (result.valid) {
            discountAmount = result.discount;
        } else {
            // invalid coupon → remove it
            await prisma.cart.update({
                where: { id: cart.id },
                data: {
                    couponCode: null,
                    discountAmount: 0
                }
            });
        }
    }

    const updatedCart = await prisma.cart.update({
        where: { id: cart.id },
        data: {
            totalAmount,
            discountAmount
        }
    });

    return {
        ...updatedCart,
        payableAmount: totalAmount - discountAmount
    };
};


// ======================= ADD TO CART =======================
const addToCart = async (req, res) => {
    try {
        const { variantId, quantity } = req.body;
        const userId = req.user.id;

        if (!variantId || Number(quantity) < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1"
            });
        }

        const variant = await prisma.productVariant.findUnique({
            where: { id: Number(variantId) }
        });

        if (!variant) {
            return res.status(404).json({ message: "Variant not found" });
        }

        if (Number(quantity) > variant.stock) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        let cart = await prisma.cart.findUnique({ where: { userId } });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId }
            });
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                variantId: Number(variantId)
            }
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: existingItem.quantity + Number(quantity)
                }
            });
        } else {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    userId,
                    variantId: Number(variantId),
                    quantity: Number(quantity)
                }
            });
        }

        const updatedCart = await recalculateCart(userId);

        return res.status(200).json({
            message: "Cart updated",
            cart: updatedCart
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ======================= UPDATE CART ITEM =======================
const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userId = req.user.id;

        const cartItem = await prisma.cartItem.findUnique({
            where: { id: Number(id) },
            include: { variant: true }
        });

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        if (Number(quantity) > cartItem.variant.stock) {
            return res.status(400).json({ message: "Insufficient stock" });
        }

        if (Number(quantity) === 0) {
            await prisma.cartItem.delete({
                where: { id: Number(id) }
            });
        } else {
            await prisma.cartItem.update({
                where: { id: Number(id) },
                data: { quantity: Number(quantity) }
            });
        }

        const updatedCart = await recalculateCart(userId);

        return res.status(200).json({
            message: "Cart recalculated",
            cart: updatedCart
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ======================= REMOVE CART ITEM =======================
const removeCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await prisma.cartItem.delete({
            where: { id: Number(id) }
        });

        const updatedCart = await recalculateCart(userId);

        return res.status(200).json({
            message: "Item removed",
            cart: updatedCart
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ======================= GET CART =======================
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await recalculateCart(userId);

        if (!cart) {
            return res.status(200).json({ items: [] });
        }

        const fullCart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: { product: true }
                        }
                    }
                }
            }
        });

        return res.status(200).json({
            ...fullCart,
            payableAmount: cart.payableAmount
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ======================= APPLY COUPON =======================
const applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user.id;

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: { product: true }
                        }
                    }
                }
            }
        });

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: "Cart is empty" });
        }

        let totalAmount = 0;
        cart.items.forEach(item => {
            totalAmount += item.quantity * item.variant.product.price;
        });

        const result = await validateCoupon({
            code,
            cart: {
                total: totalAmount,
                items: cart.items
            },
            user: req.user
        });

        if (!result.valid) {
            return res.status(400).json({ message: result.message });
        }

        await prisma.cart.update({
            where: { id: cart.id },
            data: {
                couponCode: code,
                discountAmount: result.discount,
                totalAmount
            }
        });

        const updatedCart = await recalculateCart(userId);

        return res.json({
            message: "Coupon applied successfully",
            cart: updatedCart
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


// ======================= REMOVE COUPON =======================
const removeCoupon = async (req, res) => {
    try {
        const userId = req.user.id;

        const cart = await prisma.cart.findUnique({
            where: { userId }
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        // remove coupon fields
        await prisma.cart.update({
            where: { id: cart.id },
            data: {
                couponCode: null,
                discountAmount: 0
            }
        });

        // recalculate cart after removal
        const updatedCart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: { product: true }
                        }
                    }
                }
            }
        });

        let totalAmount = 0;
        updatedCart.items.forEach(item => {
            totalAmount += item.quantity * item.variant.product.price;
        });

        await prisma.cart.update({
            where: { id: updatedCart.id },
            data: { totalAmount }
        });

        return res.status(200).json({
            message: "Coupon removed successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
};



module.exports = {
    addToCart,
    updateCartItem,
    getCart,
    removeCartItem,
    applyCoupon,
    removeCoupon
};
