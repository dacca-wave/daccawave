const { sendEmail } = require("../config/email"); // email sender

// send verification email with OTP + link
const sendVerificationEmail = async ({ to, otp, token }) => {
    const verifyLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;

    const html = `
    <h4>Dear Customer,</h4>
    <p>To complete your registration, please use the OTP below:</p>
    <h1>${otp}</h1>
    <p>Alternatively, you can verify your account by clicking the link below:</p>
    <a href="${verifyLink}">${verifyLink}</a>
    <p>This OTP and link will expire in 10 minutes. Please do not share your OTP with anyone for security reasons.</p>
    <p>If you did not create this account, please ignore this email.</p>
    <p>Best regards,</p>
    <h4>Dacca Wave</h4>
    <p>Customer Support Team</p>
  `;

    await sendEmail({
        to,
        subject: "Verify your Dacca Wave account",
        html
    });
};

module.exports = { sendVerificationEmail };
