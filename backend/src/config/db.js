const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
    log: ["query", "error"], // dev time helpful
});

module.exports = prisma;
