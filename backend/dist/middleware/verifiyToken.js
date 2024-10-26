"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
    }
    try {
        // Verify the token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Check if decoded is a valid JwtPayload object
        if (typeof decoded === 'object' && 'userId' in decoded) {
            req.userId = decoded.userId; // Explicit cast for TypeScript safety
        }
        else {
            return res.status(401).json({ success: false, message: "Unauthorized - invalid token payload" });
        }
        next(); // Proceed to the next middleware
    }
    catch (error) {
        console.log("Error in token verification: ", error);
        return res.status(500).json({ msg: "Server Error" });
    }
};
exports.verifyToken = verifyToken;
