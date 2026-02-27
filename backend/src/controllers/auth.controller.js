const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../config/email");

const { mergeGuestCartToUser } = require("./cart.controller");
const { generateOTP } = require("../utils/otp");
const { sendVerificationEmail } = require("../utils/sendVerificationEmail");
const { getResendDelayMinutes } = require("../utils/otpResendPolicy");


// ======================= SIGNUP =======================
const signup = async (req, res) => {
    try {
        const { name, email, password, contactNumber, address, country } = req.body;

        // basic validation
        if (!name || !email || !password || !contactNumber || !address || !country) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check existing user
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { contactNumber }]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists with this email or contact number"
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                contactNumber,
                address,
                country
            }
        });

        // ---------- OTP + Verification Token ----------
        const otp = generateOTP();
        const token = crypto.randomBytes(32).toString("hex");
        const now = new Date();

        await prisma.verificationToken.create({
            data: {
                userId: user.id,
                otp,
                token,

                resendCount: 1, // first OTP
                resendDay: now,
                nextResendAt: new Date(now.getTime() + 2 * 60 * 1000), // 2 min

                expiresAt: new Date(now.getTime() + 10 * 60 * 1000) // OTP expiry
            }
        });

        // send verification email
        await sendVerificationEmail({
            to: user.email,
            otp,
            token
        });

        return res.status(201).json({
            message: "User registered successfully. Please verify your email.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ======================= LOGIN =======================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );




        // // merge guest cart after login
        // await mergeGuestCartToUser(user.id);





        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};


// ======================= VERIFY BY OTP =======================
const verifyByOTP = async (req, res) => {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const record = await prisma.verificationToken.findFirst({
        where: {
            userId: user.id,
            expiresAt: { gt: new Date() }
        }
    });

    if (!record) {
        return res.status(400).json({ message: "OTP expired" });
    }

    if (record.attempts >= 5) {
        return res.status(403).json({ message: "Too many attempts" });
    }

    if (record.otp !== otp) {
        await prisma.verificationToken.update({
            where: { id: record.id },
            data: { attempts: record.attempts + 1 }
        });

        return res.status(400).json({ message: "Invalid OTP" });
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true }
    });

    await prisma.verificationToken.deleteMany({
        where: { userId: user.id }
    });

    res.json({ message: "Account verified successfully" });
};


// ======================= VERIFY BY LINK =======================
const verifyByLink = async (req, res) => {
    const { token } = req.query;

    const record = await prisma.verificationToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
        return res.status(400).json({ message: "Invalid or expired link" });
    }

    await prisma.user.update({
        where: { id: record.userId },
        data: { isVerified: true }
    });

    await prisma.verificationToken.deleteMany({
        where: { userId: record.userId }
    });

    res.json({ message: "Account verified successfully" });
};


// ======================= RESEND OTP =======================
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.isVerified) {
            return res.status(400).json({ message: "Account already verified" });
        }

        const now = new Date();

        let record = await prisma.verificationToken.findFirst({
            where: { userId: user.id }
        });

        // first time resend
        if (!record) {
            const otp = generateOTP();
            const token = crypto.randomBytes(32).toString("hex");

            const delay = getResendDelayMinutes(1);

            record = await prisma.verificationToken.create({
                data: {
                    userId: user.id,
                    otp,
                    token,
                    resendCount: 1,
                    resendDay: now,
                    nextResendAt: new Date(now.getTime() + delay * 60 * 1000),
                    expiresAt: new Date(now.getTime() + 10 * 60 * 1000)
                }
            });

            await sendVerificationEmail({ to: user.email, otp, token });

            return res.json({
                message: "OTP sent",
                nextResendAt: record.nextResendAt
            });
        }

        // reset daily count
        const sameDay =
            record.resendDay.toDateString() === now.toDateString();

        const resendCountToday = sameDay ? record.resendCount : 0;

        if (resendCountToday >= 5) {
            return res.status(429).json({
                message: "Daily OTP limit reached. Try again after 24 hours."
            });
        }

        if (record.nextResendAt > now) {
            const remainingSeconds = Math.ceil(
                (record.nextResendAt - now) / 1000
            );

            return res.status(429).json({
                message: "Please wait before resending OTP",
                remainingSeconds
            });
        }

        const newCount = resendCountToday + 1;
        const delay = getResendDelayMinutes(newCount);

        const otp = generateOTP();
        const token = crypto.randomBytes(32).toString("hex");

        await prisma.verificationToken.update({
            where: { id: record.id },
            data: {
                otp,
                token,
                resendCount: newCount,
                resendDay: now,
                nextResendAt: new Date(now.getTime() + delay * 60 * 1000),
                expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
                attempts: 0
            }
        });

        await sendVerificationEmail({ to: user.email, otp, token });

        res.json({
            message: "OTP resent",
            nextResendAt: new Date(now.getTime() + delay * 60 * 1000),
            resendCount: newCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};





// ======================= FORGOT PASSWORD =======================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        // security: always same response
        if (!user) {
            return res.json({
                message: "If the email exists, a reset link has been sent"
            });
        }

        // generate OTP + token
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const token = crypto.randomBytes(32).toString("hex");

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        // invalidate old tokens
        await prisma.passwordResetToken.updateMany({
            where: {
                userId: user.id,
                used: false
            },
            data: {
                used: true
            }
        });

        // create new reset token
        await prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                otp,
                token,
                expiresAt
            }
        });

        // reset link (frontend will handle)
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        // send email
        await sendEmail({
            to: user.email,
            subject: "Reset Your Password - Dacca Wave",
            html: `
        <h4>Dear Customer,</h4>
<p>You requested to reset your password.</p>
<p>Please use the OTP below to proceed: <strong>${otp}</strong></p>
<p>This OTP will expire in 10 minutes.</p>
<p>Or click here to reset your password:</p>
<a href="${resetLink}">${resetLink}</a>
<p>The OTP and link will expire in 10 minutes.</p>
<p>If you didn’t request this, please ignore this email.</p>
<p></p>
<p>Thanks,</p>
<p>Support Team</p>
      `
        });

        return res.json({
            message: "If the email exists, a reset link has been sent"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};



// ======================= RESET PASSWORD =======================
const resetPassword = async (req, res) => {
    try {
        const { otp, token, newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }

        // must provide otp or token
        if (!otp && !token) {
            return res.status(400).json({
                message: "OTP or reset token required"
            });
        }

        // find valid reset token
        const resetRecord = await prisma.passwordResetToken.findFirst({
            where: {
                used: false,
                expiresAt: { gt: new Date() },
                ...(otp ? { otp } : {}),
                ...(token ? { token } : {})
            },
            include: {
                user: true
            }
        });

        if (!resetRecord) {
            return res.status(400).json({
                message: "Invalid or expired reset request"
            });
        }

        // hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // update user password
        await prisma.user.update({
            where: { id: resetRecord.userId },
            data: {
                password: hashedPassword
            }
        });

        // mark token as used
        await prisma.passwordResetToken.update({
            where: { id: resetRecord.id },
            data: { used: true }
        });
        // send confirmation email
        await sendEmail({
            to: resetRecord.user.email,
            subject: "Password Reset Successfully - Dacca Wave",
            html: `
    <h4>Dear Customer,</h4>
<p>This is to confirm that your account password has been reset successfully.</p>
<p>You can now log in to your account using your new password.</p>
<p>If you did not perform this action, please contact our support team immediately.</p>
<p>For security reasons, we recommend that you never share your login details with anyone.
</p>
<p></p>
<p>Best regards,</p>
<h4>Dacca Wave</h4>
<p>Customer Support Team</p>
  `
        });


        return res.json({
            message: "Password reset successful. Please login again."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};




// ======================= EXPORTS =======================
module.exports = {
    signup,
    login,
    verifyByOTP,
    verifyByLink,
    resendOTP,
    forgotPassword,
    resetPassword

};
