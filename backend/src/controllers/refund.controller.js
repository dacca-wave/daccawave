const prisma = require("../config/db");
const { sendRefundRequestEmail } = require("../utils/sendRefundRequestEmail");
const { sendEmail } = require("../config/email");

// ======================= USER REFUND REQUEST =======================
const createRefundRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId, reason, message } = req.body;

        // image must exist
        if (!req.file) {
            return res.status(400).json({
                message: "Damage image is required"
            });
        }

        // basic validation
        if (!orderId || !reason) {
            return res.status(400).json({
                message: "Order ID and reason are required"
            });
        }

        // find order
        const order = await prisma.order.findUnique({
            where: { id: Number(orderId) }
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // ownership check
        if (order.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // must be delivered
        if (order.status !== "DELIVERED") {
            return res.status(400).json({
                message: "Refund allowed only for delivered orders"
            });
        }

        // check already requested
        const existing = await prisma.refundRequest.findUnique({
            where: { orderId: Number(orderId) }
        });

        if (existing) {
            return res.status(400).json({
                message: "Refund request already submitted for this order"
            });
        }

        // create refund request
        const refund = await prisma.refundRequest.create({
            data: {
                userId,
                orderId: Number(orderId),
                reason,
                message,
                imageUrl: `/uploads/refunds/${req.file.filename}`
            }
        });

        // send confirmation email
        await sendRefundRequestEmail({
            to: order.email,
            orderId: order.id
        });

        return res.status(201).json({
            message: "Refund request submitted successfully",
            refund
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ======================= ADMIN - VIEW REFUND REQUESTS =======================
const getAllRefundRequests = async (req, res) => {
    try {
        // optional status filter
        const { status } = req.query;

        const whereCondition = status ? { status } : {};

        const refunds = await prisma.refundRequest.findMany({
            where: whereCondition,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                order: {
                    select: {
                        id: true,
                        status: true,
                        totalAmount: true,
                        paymentMethod: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json(refunds);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};





// ======================= ADMIN APPROVE REFUND =======================
const approveRefund = async (req, res) => {
    try {
        const refundId = Number(req.params.id);

        const refund = await prisma.refundRequest.findUnique({
            where: { id: refundId },
            include: {
                user: true,
                order: true
            }
        });

        if (!refund) {
            return res.status(404).json({ message: "Refund request not found" });
        }

        if (refund.status !== "REQUESTED") {
            return res.status(400).json({
                message: "Refund request already processed"
            });
        }

        await prisma.refundRequest.update({
            where: { id: refundId },
            data: { status: "APPROVED" }
        });

        // email user
        await sendEmail({
            to: refund.user.email,
            subject: "Refund Approved - Dacca Wave",
            html: `
        <h2>Refund Approved</h2>
        <p>Your refund request for Order <strong>#${refund.order.id}</strong> has been approved.</p>
      `
        });

        return res.json({ message: "Refund approved successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

// ======================= ADMIN REJECT REFUND =======================
const rejectRefund = async (req, res) => {
    try {
        const refundId = Number(req.params.id);
        const { adminNote } = req.body;

        const refund = await prisma.refundRequest.findUnique({
            where: { id: refundId },
            include: {
                user: true,
                order: true
            }
        });

        if (!refund) {
            return res.status(404).json({ message: "Refund request not found" });
        }

        if (refund.status !== "REQUESTED") {
            return res.status(400).json({
                message: "Refund request already processed"
            });
        }

        await prisma.refundRequest.update({
            where: { id: refundId },
            data: {
                status: "REJECTED",
                adminNote
            }
        });

        // email user
        await sendEmail({
            to: refund.user.email,
            subject: "Refund Rejected - Dacca Wave",
            html: `
        <h2>Refund Rejected</h2>
        <p>Your refund request for Order <strong>#${refund.order.id}</strong> has been rejected.</p>
        <p>Reason: ${adminNote || "Not specified"}</p>
      `
        });

        return res.json({ message: "Refund rejected successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};



// ======================= USER - MY REFUND REQUESTS =======================
const getMyRefundRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const refunds = await prisma.refundRequest.findMany({
            where: { userId },
            include: {
                order: {
                    select: {
                        id: true,
                        status: true,
                        paymentMethod: true,
                        totalAmount: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json(refunds);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};




module.exports = {
    createRefundRequest,
    getAllRefundRequests,
    approveRefund,
    rejectRefund,
    getMyRefundRequests
};
