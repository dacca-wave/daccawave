// payment.controller.js
// Real Stripe Integration (Secure Server-side Amount Calculation)

const prisma = require("../config/db");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const { generateInvoice } = require("../invoices/generateInvoice");
const { sendInvoiceEmail } = require("../utils/sendInvoiceEmail");

// ======================= CREATE PAYMENT INTENT =======================
const createPaymentIntent = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1️⃣ Fetch cart with items
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
            return res.status(400).json({ message: "Cart is empty" });
        }

        // 2️⃣ Calculate total securely from DB
        let totalAmount = 0;
        cart.items.forEach(item => {
            totalAmount += item.quantity * item.variant.product.price;
        });

        const discountAmount = cart.discountAmount || 0;
        const payableAmount = totalAmount - discountAmount;

        if (payableAmount <= 0) {
            return res.status(400).json({ message: "Invalid payable amount" });
        }

        // 3️⃣ Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(payableAmount * 100), // convert to paisa
            currency: "bdt",
            metadata: {
                userId: userId.toString()
            }
        });

        // 4️⃣ Save Payment record (PENDING)
        const payment = await prisma.payment.create({
            data: {
                userId,
                amount: payableAmount,
                currency: "BDT",
                provider: "STRIPE",
                status: "PENDING",
                transactionId: paymentIntent.id
            }
        });

        return res.status(201).json({
            clientSecret: paymentIntent.client_secret,
            paymentId: payment.id
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ======================= STRIPE WEBHOOK =======================
const stripeWebhook = async (req, res) => {
    try {

        const sig = req.headers["stripe-signature"];

        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === "payment_intent.succeeded") {

            const paymentIntent = event.data.object;

            const payment = await prisma.payment.findFirst({
                where: { transactionId: paymentIntent.id }
            });

            if (!payment) return res.json({ received: true });

            if (payment.status === "PAID") {
                return res.json({ received: true });
            }

            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "PAID" }
            });

            const userId = payment.userId;

            // ===== FETCH CART =====
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
                return res.json({ received: true });
            }

            // ===== RECALCULATE TOTAL =====
            let totalAmount = 0;
            cart.items.forEach(item => {
                totalAmount += item.quantity * item.variant.product.price;
            });

            const discountAmount = cart.discountAmount || 0;
            const payableAmount = totalAmount - discountAmount;

            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            // ===== CREATE ORDER =====
            const createdOrder = await prisma.order.create({
                data: {
                    userId,
                    name: user.name,
                    email: user.email,
                    contactNumber: user.contactNumber,
                    address: user.address,
                    country: user.country,

                    totalAmount,
                    discountAmount,
                    couponCode: cart.couponCode,
                    payableAmount,

                    paymentMethod: "Online Payment",
                    paymentStatus: "PAID",
                    status: "ACCEPTED",

                    orderItems: {
                        create: cart.items.map(item => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                            price: item.variant.product.price
                        }))
                    }
                }
            });

            // ===== REDUCE STOCK =====
            for (const item of cart.items) {
                await prisma.productVariant.update({
                    where: { id: item.variantId },
                    data: {
                        stock: { decrement: item.quantity }
                    }
                });
            }

            // ===== FETCH FULL ORDER FOR INVOICE =====
            const fullOrder = await prisma.order.findUnique({
                where: { id: createdOrder.id },
                include: {
                    orderItems: {
                        include: {
                            variant: {
                                include: { product: true }
                            }
                        }
                    }
                }
            });

            // ===== GENERATE INVOICE =====
            const invoicePath = await generateInvoice(fullOrder);

            // ===== SEND EMAIL =====
            await sendInvoiceEmail({
                order: fullOrder,
                invoicePath
            });


            // ===== CLEAR CART =====
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            await prisma.cart.update({
                where: { id: cart.id },
                data: {
                    couponCode: null,
                    discountAmount: 0,
                    totalAmount: 0
                }
            });
        }

        res.json({ received: true });

    } catch (error) {
        console.error("WEBHOOK ERROR:", error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
};



module.exports = {
    createPaymentIntent,
    stripeWebhook
};
