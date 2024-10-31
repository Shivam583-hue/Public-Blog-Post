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
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.verifyToken = ((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
    }
    try {
        // Verify the token  
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Check if decoded structure is as expected  
        if ((decoded === null || decoded === void 0 ? void 0 : decoded.userId) && (decoded === null || decoded === void 0 ? void 0 : decoded.username)) {
            req.userId = decoded.userId;
            req.username = decoded.username; // Attach username to the request object
        }
        else {
            return res.status(401).json({ success: false, message: "Unauthorized - invalid token payload" });
        }
        next(); // Proceed to the next middleware  
    }
    catch (error) {
        // Differentiating between different types of errors  
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: "Token expired" });
        }
        else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        console.error("Error in token verification: ", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}));
