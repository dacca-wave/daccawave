const nodemailer = require("nodemailer");

// create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// reusable email sender (with optional attachment)
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
    await transporter.sendMail({
        from: `"Dacca Wave" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments // pdf attachment support
    });
};

module.exports = { sendEmail };
