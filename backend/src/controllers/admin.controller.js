const prisma = require("../config/db");

// ======================= DASHBOARD OVERVIEW =======================
const getDashboardOverview = async (req, res) => {
    try {
        // total orders
        const totalOrders = await prisma.order.count();

        // total sales (only delivered & paid)
        const totalSalesAgg = await prisma.order.aggregate({
            _sum: {
                payableAmount: true
            },
            where: {
                status: "DELIVERED",
                paymentStatus: "PAID"
            }
        });

        const totalSales = totalSalesAgg._sum.payableAmount || 0;

        // total users
        const totalUsers = await prisma.user.count();

        return res.status(200).json({
            totalOrders,
            totalSales,
            totalUsers
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};



// ======================= LOW STOCK ALERT =======================
const getLowStockVariants = async (req, res) => {
    try {
        const lowStockVariants = await prisma.productVariant.findMany({
            where: {
                stock: {
                    lt: 5
                }
            },
            include: {
                product: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                stock: "asc"
            }
        });

        return res.status(200).json(lowStockVariants);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};



// ======================= MONTHLY ANALYTICS =======================
const getMonthlyAnalytics = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                status: "DELIVERED",
                paymentStatus: "PAID"
            },
            select: {
                createdAt: true,
                payableAmount: true
            }
        });

        const monthlyData = {};

        orders.forEach(order => {
            const month = order.createdAt.toLocaleString("en-US", {
                month: "short",
                year: "numeric"
            });

            if (!monthlyData[month]) {
                monthlyData[month] = {
                    month,
                    orders: 0,
                    sales: 0
                };
            }

            monthlyData[month].orders += 1;
            monthlyData[month].sales += order.payableAmount;
        });

        const result = Object.values(monthlyData);

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ======================= RECENT ORDERS =======================
const getRecentOrders = async (req, res) => {
    try {
        const recentOrders = await prisma.order.findMany({
            take: 10, // last 10 orders
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                name: true,
                totalAmount: true,
                payableAmount: true,
                paymentMethod: true,
                paymentStatus: true,
                status: true,
                createdAt: true
            }
        });

        return res.status(200).json(recentOrders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    getDashboardOverview,
    getLowStockVariants,
    getMonthlyAnalytics,
    getRecentOrders

};
