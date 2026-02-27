const { sendEmail } = require("../config/email");

const sendOrderCancelEmail = async ({ to, orderId }) => {
    await sendEmail({
        to,
        subject: "Order Cancelled - Dacca Wave",
        html: `
      <h2>Your order has been cancelled</h2>
      <p>Order ID: <strong>#${orderId}</strong></p>
      <p>If this was a mistake, please contact support.</p>
    `
    });
};

module.exports = { sendOrderCancelEmail };
