"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.signin = exports.signout = exports.signup = exports.verificationToken = void 0;
const zod_1 = __importDefault(require("zod"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const emails_1 = require("../mailtrap/emails");
const ZodSchema = zod_1.default.object({
    username: zod_1.default.string(),
    email: zod_1.default.string(),
    password: zod_1.default.string(),
});
const Zod2Schema = zod_1.default.object({
    email: zod_1.default.string(),
    password: zod_1.default.string(),
});
function generateTokenAndSetCookie(res, userId, username) {
    const token = jsonwebtoken_1.default.sign({ userId, username }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.cookie("token", token, {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        maxAge: 15 * 24 * 60 * 60 * 1000, //15 days
    });
    return token;
}
;
// Generate verification code
exports.verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
exports.signup = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    // Validate inputs
    const safeparse = ZodSchema.safeParse(req.body);
    if (!safeparse.success) {
        return res.send("Invalid Inputs");
    }
    // Check if user already exists
    const userAlreadyExists = yield prisma.user.findUnique({ where: { email } });
    if (userAlreadyExists) {
        return res.send("User with this email already exists");
    }
    // Hash password
    const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
    // Create new user in Prisma
    const user = yield prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            username,
            verificationToken: exports.verificationToken,
            verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
    });
    // JWT
    generateTokenAndSetCookie(res, user.id, user.username);
    // Send verification token to email
    yield (0, emails_1.sendVerificationEmail)(user.email, exports.verificationToken);
    res.status(201).json({
        success: true,
        message: "User created successfully!",
        user: Object.assign(Object.assign({}, user), { password: undefined }),
    });
}));
exports.signout = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully!" });
}));
exports.signin = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const parse = Zod2Schema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ success: false, message: "Wrong input formats" });
    }
    try {
        // Find the user by email
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found! Please sign up" });
        }
        // Check if the password is correct
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }
        // Generate token and set it as a cookie
        const token = generateTokenAndSetCookie(res, user.id, user.username);
        // Update last login timestamp
        yield prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        // Successful response
        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                isVerified: user.isVerified,
            },
            token // Optionally include token for frontend
        });
    }
    catch (error) {
        console.error("Error in signin endpoint: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
exports.verifyEmail = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.body;
    try {
        // Find the most recently created unverified user
        const user = yield prisma.user.findFirst({
            where: {
                isVerified: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No unverified user found"
            });
        }
        // Update user to verified status
        const updatedUser = yield prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpiresAt: null,
            },
            select: {
                id: true,
                email: true,
                username: true,
                isVerified: true,
                profilePic: true
            }
        });
        // Generate a new token for the verified user
        const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            success: true,
            message: "Email verified successfully!",
            user: updatedUser,
            token
        });
    }
    catch (e) {
        console.error("Error in email verification:", e);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}));
exports.forgotPassword = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.json({ error: "User not found" });
        }
        const resetToken = crypto_1.default.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        yield prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpiresAt: resetTokenExpiresAt,
            },
        });
        yield (0, emails_1.sendPasswordResetEmail)(user.email, `https://public-blog-post.vercel.app/${resetToken}`);
        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    }
    catch (e) {
        console.log("Error in forgot password endpoint", e);
        res.status(400).json({ success: false, message: e.message });
    }
}));
exports.resetPassword = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = yield prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpiresAt: { gt: new Date() },
            },
        });
        if (!user) {
            return res.json({ Error: "User not found" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpiresAt: null,
            },
        });
        yield (0, emails_1.sendResetSuccessEmail)(user.email);
    }
    catch (error) {
        console.log("Error resetting Password", error);
    }
}));
exports.checkAuth = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userId) {
            return res.status(401).json({ success: false, message: "Unauthorized - user not authenticated" });
        }
        const user = yield prisma.user.findUnique({ where: { id: req.userId } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }
        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                isVerified: user.isVerified,
            },
        });
    }
    catch (error) {
        console.error("Error at the checkAuth endpoint:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}));
