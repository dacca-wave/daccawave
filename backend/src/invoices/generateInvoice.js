const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = async (order) => {
    return new Promise((resolve, reject) => {
        try {
            const invoiceDir = path.join(__dirname, "generated");

            if (!fs.existsSync(invoiceDir)) {
                fs.mkdirSync(invoiceDir, { recursive: true });
            }

            const invoicePath = path.join(invoiceDir, `invoice-${order.id}.pdf`);

            // মার্জিন ৪০ রাখা হয়েছে যাতে ছবির মতো স্পেস থাকে
            const doc = new PDFDocument({ size: "A4", margin: 40 });
            const stream = fs.createWriteStream(invoicePath);
            doc.pipe(stream);

            const pageW = doc.page.width;
            const margin = 40;

            const formatAmount = (val) => {
                const n = Number(val || 0);
                return new Intl.NumberFormat("en-GB", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(n) + "/-";
            };

            /* ================= HEADER & LOGO ================= */

            // ১. লোগো বসানো (অবশ্যই logo.png ফাইলটি ফোল্ডারে থাকতে হবে)
            const logoPath = path.join(__dirname, "logo.png");

            // লোগো থাকলে সেটা বসাবে, না থাকলে ফাঁকা রাখবে (যাতে এরর না দেয়)
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, margin, margin, { width: 100 }); // ছবির মতো সাইজ (৭০px)
            }

            // ২. ডান পাশের তারিখ এবং ইনভয়েস নম্বর (লোগোর সোজাসুজি ডানদিকে)
            const createdStr = new Date(order.createdAt).toLocaleDateString("en-GB");

            doc.fontSize(10)
                .fillColor("#000")
                .text(`No. ${order.id}`, pageW - margin - 160, margin + 10, {
                    width: 160,
                    align: "right"
                })
                .text(`Date: ${createdStr}`, { align: "right" });

            // ৩. INVOICE টাইটেল (লোগোর নিচে)
            doc.fontSize(42)
                .fillColor("#111")
                .text("INVOICE", margin, margin + 80); // লোগোর জন্য ৮০px নিচে নামানো হলো

            /* ================= BILLED TO / FROM ================= */

            const billedY = margin + 120; // INVOICE লেখার নিচে স্পেস
            const leftX = margin;
            const rightX = pageW / 2 + 10;

            // Billed To (Left Side)
            doc.fontSize(10)
                .text("Billed to:", leftX, billedY)
                .moveDown(0.3)
                .text(order.name, leftX)
                .text(order.email || "-");

            if (order.contactNumber) {
                doc.text(order.contactNumber);
            }

            // From (Right Side - Dacca Wave)
            doc.text("From:", rightX, billedY)
                .moveDown(0.3)
                .text("Dacca Wave", rightX)
                .text("daccawave@gmail.com");


            /* ================= ITEMS TABLE ================= */

            const tableTop = billedY + 80;
            const tableX = margin;

            // কলামের সাইজ ছবির মতো করে অ্যাডজাস্ট করা হলো
            const col = { no: 30, item: 260, qty: 50, price: 80, amount: 90 };

            const pos = {
                no: tableX,
                item: tableX + col.no,
                qty: tableX + col.no + col.item,
                price: tableX + col.no + col.item + col.qty,
                amount: tableX + col.no + col.item + col.qty + col.price
            };

            // টেবিল হেডার ব্যাকগ্রাউন্ড (হালকা ধূসর)
            doc.rect(tableX - 5, tableTop - 5, pageW - 2 * margin + 10, 20)
                .fill("#f2f2f2");

            // টেবিল হেডার টেক্সট
            doc.fillColor("#000")
                .fontSize(10)
                // ছবিতে নাম্বারের হেডার নেই, তাই ফাঁকা রাখা হলো
                .text("Item", pos.item, tableTop)
                .text("Quantity", pos.qty, tableTop, { width: col.qty, align: "center" })
                .text("Price", pos.price, tableTop, { width: col.price, align: "right" })
                .text("Amount", pos.amount, tableTop, { width: col.amount, align: "right" });

            doc.y = tableTop + 25; // আইটেম শুরু হবে এখান থেকে

            let total = 0;

            // order.orderItems.forEach((item, idx) => {
            //     const amount = item.quantity * item.price;
            //     total += amount;

            //     // আইটেম নাম + সাইজ/কালার ফরম্যাট করা
            //     let itemName = item.variant.product.name;
            //     if (item.variant.size || item.variant.color) {
            //         itemName += ` (${item.variant.size || ''}/${item.variant.color || ''})`;
            //     }

            //     doc.fontSize(10)
            //         .text(String(idx + 1), pos.no, doc.y, { width: col.no }) // ১, ২, ৩...
            //         .text(itemName, pos.item, doc.y, { width: col.item })
            //         .text(item.quantity, pos.qty, doc.y, { width: col.qty, align: "center" })
            //         .text(formatAmount(item.price), pos.price, doc.y, { width: col.price, align: "right" })
            //         .text(formatAmount(amount), pos.amount, doc.y, { width: col.amount, align: "right" });

            //     doc.moveDown(1); // প্রতি লাইনে একটু স্পেস
            // });


            order.orderItems.forEach((item, idx) => {

                const rowY = doc.y; // current row starting Y

                const amount = item.quantity * item.price;

                let itemName = item.variant.product.name;
                if (item.variant.size || item.variant.color) {
                    itemName += ` (${item.variant.size || ''}/${item.variant.color || ''})`;
                }

                doc.fontSize(10);

                // Serial
                doc.text(String(idx + 1), pos.no, rowY, { width: col.no });

                // Item Name (this may wrap)
                doc.text(itemName, pos.item, rowY, { width: col.item });

                // Quantity
                doc.text(item.quantity, pos.qty, rowY, {
                    width: col.qty,
                    align: "center"
                });

                // Price
                doc.text(formatAmount(item.price), pos.price, rowY, {
                    width: col.price,
                    align: "right"
                });

                // Amount
                doc.text(formatAmount(amount), pos.amount, rowY, {
                    width: col.amount,
                    align: "right"
                });

                // 🔥 FUTURE PROOF HEIGHT CALCULATION
                const itemHeight = doc.heightOfString(itemName, { width: col.item });

                // move Y manually based on tallest content
                doc.y = rowY + Math.max(itemHeight, 20);
            });






            /* ================= TOTAL ================= */

            doc.moveDown(1);

            // শুধু ফাইনাল টোটাল দেখানো হচ্ছে (ছবির মতো)
            // সাবটোটাল বা ডিসকাউন্ট চাইলে আন-কমেন্ট করতে পারেন
            /*
            if (order.discountAmount > 0) {
                 doc.text(`Subtotal: ${formatAmount(order.totalAmount)}`, { align: "right" });
                 doc.text(`Discount: -${formatAmount(order.discountAmount)}`, { align: "right" });
            }
            */

            doc.fontSize(12) // টোটাল লেখাটা একটু বড়
                .text(`Total: ${formatAmount(order.payableAmount)}`, {
                    align: "right"
                });

            /* ================= FOOTER (Payment, Address, Note) ================= */
            /* ================= FOOTER SECTION ================= */

            // Move down to footer area.
            // Using a fixed position or relative moveDown depending on how many items you expect.
            doc.moveDown(4); // Ensure it's low enough. Alternatively use doc.moveDown(5);

            doc.fontSize(10)
                .text(`Payment method: ${order.paymentMethod}`, margin, doc.y)
                .moveDown(1)
                .text("Billing address:")
                // Combining address parts to match the single line style in the image
                .text(`${order.address}, ${order.city || 'Dhaka'}, ${order.country || 'Bangladesh'}${order.zipCode ? ' - ' + order.zipCode : ''}`)
                .moveDown(1)
                .text("Note: Thank you for choosing us!");

            doc.end();

            stream.on("finish", () => {
                resolve(invoicePath);
            });
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateInvoice };