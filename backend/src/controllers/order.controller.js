const prisma = require("../config/db"); // prisma client
const { generateInvoice } = require("../invoices/generateInvoice"); // invoice pdf
const { sendInvoiceEmail } = require("../utils/sendInvoiceEmail");  // email invoice
const { sendOrderCancelEmail } = require("../utils/sendOrderCancelEmail"); //cancel email


// ======================= PLACE ORDER (COD) =======================
const placeOrderCOD = async (req, res) => {
    try {
        const userId = req.user.id; // logged-in user

        // get user profile snapshot
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        // user must be verified
        if (!user.isVerified) {
            return res.status(403).json({ message: "Account not verified" });
        }

        // get cart with coupon info
        const cart = await prisma.cart.findFirst({
            where: { userId }
        });

        if (!cart) {
            return res.status(400).json({ message: "Cart not found" });
        }

        // get cart items
        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: {
                variant: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // calculate total amount
        let totalAmount = 0;
        cartItems.forEach(item => {
            totalAmount += item.quantity * item.variant.product.price;
        });

        const discountAmount = cart.discountAmount || 0;
        const payableAmount = totalAmount - discountAmount;

        // create order with coupon snapshot
        const order = await prisma.order.create({
            data: {
                userId,
                name: user.name,
                email: user.email,
                contactNumber: user.contactNumber,
                address: user.address,
                country: user.country,

                totalAmount,
                discountAmount,          // coupon discount
                couponCode: cart.couponCode, // applied coupon
                payableAmount,

                paymentMethod: "Cash On Delivery",
                paymentStatus: "Waiting for Payment",
                status: "PENDING",

                orderItems: {
                    create: cartItems.map(item => ({
                        variantId: item.variantId,
                        quantity: item.quantity,
                        price: item.variant.product.price // price snapshot
                    }))
                }
            }
        });

        // increase coupon usage count
        if (cart.couponCode) {
            await prisma.coupon.update({
                where: { code: cart.couponCode },
                data: {
                    usedCount: { increment: 1 }
                }
            });
        }

        // fetch full order for invoice
        const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: {
                orderItems: {
                    include: {
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            }
        });

        // generate invoice pdf
        const invoicePath = await generateInvoice(fullOrder);

        // // send invoice email
        // await sendInvoiceEmail({
        //     to: fullOrder.email,
        //     orderId: fullOrder.id,
        //     invoicePath
        // });


        await sendInvoiceEmail({
            order: fullOrder,
            invoicePath
        });



        // reduce stock
        for (const item of cartItems) {
            await prisma.productVariant.update({
                where: { id: item.variantId },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });
        }

        // clear cart after order
        await prisma.cartItem.deleteMany({
            where: { userId }
        });

        await prisma.cart.update({
            where: { id: cart.id },
            data: {
                couponCode: null,
                discountAmount: 0
            }
        });

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId: order.id, payableAmount, invoiceGenerated: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};


// ======================= USER: MY ORDERS =======================
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                orderItems: {
                    include: {
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ======================= ADMIN: ALL ORDERS =======================
const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true,
                orderItems: {
                    include: {
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ======================= ADMIN: UPDATE ORDER STATUS =======================
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatus = [
            "PENDING",
            "ACCEPTED",
            "PROCESSING",
            "SHIPPING",
            "DELIVERED",
            "CANCELLED"
        ];

        //Order Status Validation
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid order status" });
        }

        const order = await prisma.order.findUnique({
            where: { id: Number(id) }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: Number(id) },
            data: { status }
        });

        return res.status(200).json({
            message: "Order status updated",
            order: updatedOrder
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};



// ======================= USER ORDER CANCEL =======================
const cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = Number(req.params.id);

        // find order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: true
            }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // ownership check
        if (order.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // allowed status check
        const cancellableStatus = ["PENDING", "ACCEPTED", "PROCESSING"];

        if (!cancellableStatus.includes(order.status)) {
            return res.status(400).json({
                message: "Order cannot be cancelled at this stage"
            });
        }

        // update order status
        await prisma.order.update({
            where: { id: order.id },
            data: { status: "CANCELLED" }
        });

        // restore stock
        for (const item of order.orderItems) {
            await prisma.productVariant.update({
                where: { id: item.variantId },
                data: {
                    stock: { increment: item.quantity }
                }
            });
        }

        // send cancel email
        await sendOrderCancelEmail({
            to: order.email,
            orderId: order.id
        });

        return res.json({
            message: "Order cancelled successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    placeOrderCOD,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
};
