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
exports.checkAuth = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.signin = exports.signup = void 0;
exports.signout = signout;
const zod_1 = __importDefault(require("zod"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
function generateTokenAndSetCookie(res, userId) {
    const token = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        maxAge: 15 * 24 * 60 * 60 * 1000, //15 days
    });
    return token;
}
;
exports.signup = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    // Validate inputs
    const safeparse = ZodSchema.safeParse(req.body);
    if (!safeparse.success) {
        return res.send("Invalid Inputs");
    }
    // Check if user already exists
    const userAlreadyExists = yield db_1.default.findOne({ email });
    if (userAlreadyExists) {
        return res.send("User with this email already exists");
    }
    // Hash password
    const hashedpassword = yield bcryptjs_1.default.hash(password, 10);
    // Generate verification code
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    // Create new user model
    const user = new db_1.default({
        email,
        password: hashedpassword,
        username,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    // Saving the instance to the database
    yield user.save();
    // JWT
    generateTokenAndSetCookie(res, user._id);
    // Send verification token to email
    yield (0, emails_1.sendVerificationEmail)(user.email, verificationToken);
    // Convert to plain object and respond
    const userObject = user.toObject(); // Safely convert Mongoose document
    res.status(201).json({
        success: true,
        message: "User created successfully!",
        user: Object.assign(Object.assign({}, userObject), { password: undefined }),
    });
}));
function signout(req, res) {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully!" });
}
exports.signin = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const parse = Zod2Schema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ message: "Wrong Input Formats" });
    }
    try {
        // Find the user by email
        const user = yield db_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found! Please Signup" });
        }
        // Check if the password is correct
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect Password" });
        }
        // Generate token and set it as a cookie
        generateTokenAndSetCookie(res, user._id);
        // Update last login timestamp
        user.lastLogin = new Date();
        yield user.save();
        // Respond with the user data and success message
        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                isVerified: user.isVerified, // Include the verification status
            }
        });
    }
    catch (e) {
        console.error("Error: ", e);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.verifyEmail = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.body;
    try {
        const user = yield db_1.default.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        yield user.save();
        yield (0, emails_1.sendWelcomeEmail)(user.email, user.username);
        res.json({
            success: true,
            message: "The verify email endpoint works"
        });
    }
    catch (e) {
        console.log("error", e);
    }
}));
exports.forgotPassword = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield db_1.default.findOne({ email });
        if (!user) {
            return res.json({ error: "User not found" });
        }
        //Generate a reset password response token
        const resetToken = crypto_1.default.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;
        yield user.save();
        //send email
        yield (0, emails_1.sendPasswordResetEmail)(user.email, `http://localhost:5173/reset-password/${resetToken}`);
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
        const user = yield db_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() }
        });
        if (!user) {
            return res.json({ Error: "User not found" });
        }
        //update password 
        const hashedpassword = yield bcryptjs_1.default.hash(password, 10);
        user.password = hashedpassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        yield user.save();
        //sending reset email successfull email
        yield (0, emails_1.sendResetSuccessEmail)(user.email);
    }
    catch (error) {
        console.log("Error resetting Password", error);
    }
}));
exports.checkAuth = ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield db_1.default.findById(req.userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found!" });
        }
    }
    catch (error) {
        console.log("Error at the checkAuth endpoint", error);
    }
}));
