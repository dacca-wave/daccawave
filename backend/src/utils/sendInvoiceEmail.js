const { sendEmail } = require("../config/email");

// helper: calculate estimated delivery (7 days later)
const getEstimatedDeliveryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString("en-GB");
};

const sendInvoiceEmail = async ({ order, invoicePath }) => {
    const estimatedDelivery = getEstimatedDeliveryDate();

    const itemsHtml = order.orderItems
        .map(
            item => `
        <li>
          ${item.variant.product.name} — 
          Color: <strong>${item.variant.color}</strong> —
          Qty: <strong>${item.quantity}</strong> × 
          Price: <strong>${item.price}</strong> /-
        </li>
      `
        )
        .join("");

    const html = `
    <div style="font-family: Times New Roman; line-height: 1.6;">
      <p>Dear ${order.name},</p>

        <p>Thank you for shopping with <strong>Dacca Wave</strong>!<br/>
        We’re pleased to inform you that your order <strong>#${order.id}</strong> has been successfully <strong>confirmed</strong>.</p>

        <p><strong>Here are your order details:</strong></p>
        <ul>
            <li><strong>Order ID:</strong> ${order.id}</li>
            <li><strong>Items Ordered:</strong><br/> ${itemsHtml} </li>
            <li><strong>Total Amount:</strong> ${order.totalAmount}/-</li>
            <li style="color: red;"><strong>Discount:</strong> -${order.discountAmount}/-</li>
            <li><strong>Payable Amount:</strong> ${order.payableAmount}/-</li>
            <li><strong>Estimated Delivery Date:</strong> ${estimatedDelivery}</li>
            <li><strong>Shipping Address:</strong><br/> ${order.address}, ${order.country}</li>
            <li><strong>Payment Method:</strong> ${order.paymentMethod}</li>
        </ul>

        <p>You’ll receive another email once your order has been shipped.<br/>
        If you have any questions or need assistance, contact <a href="mailto:daccawave@gmail.com">support@daccawave.com</a>.</p>

        <p>Warm regards,<br/>Dacca Wave Team<br/>📧 Bangladesh</p>

    </div>
  `;

    await sendEmail({
        to: order.email,
        subject: `Your Order Has Been Confirmed - Thank You for Shopping with Dacca Wave!`,
        html,
        attachments: [
            {
                filename: `invoice-${order.id}.pdf`,
                path: invoicePath
            }
        ]
    });
};

module.exports = { sendInvoiceEmail };
