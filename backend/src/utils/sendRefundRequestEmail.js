const { sendEmail } = require("../config/email");


const sendRefundRequestEmail = async ({ to, orderId }) => {
    await sendEmail({
        to,
        subject: "Refund Request Submitted - Dacca Wave",
        html: `
      <h2>Refund Request Received</h2>
      <p>Your refund request for Order <strong>#${orderId}</strong> has been submitted.</p>
      <p>Our team will review it and update you soon.</p>
    `
    });
};

module.exports = { sendRefundRequestEmail };
