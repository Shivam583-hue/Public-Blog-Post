import jwt, { JwtPayload } from "jsonwebtoken";
import express, { Request, Response, NextFunction } from "express";
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = (req: any, res: any, next: NextFunction) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
    }
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if decoded is a valid JwtPayload object
        if (typeof decoded === 'object' && 'userId' in decoded) {
            req.userId = (decoded as JwtPayload).userId; // Explicit cast for TypeScript safety
        } else {
            return res.status(401).json({ success: false, message: "Unauthorized - invalid token payload" });
        }
        
        next(); // Proceed to the next middleware
    } catch (error) {
        console.log("Error in token verification: ", error);
        return res.status(500).json({ msg: "Server Error" });
    }
};
