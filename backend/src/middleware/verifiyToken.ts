import jwt, { JwtPayload } from "jsonwebtoken";  
import express, { Request, Response, NextFunction } from "express";  
import dotenv from 'dotenv';  

dotenv.config();  

interface DecodedToken extends JwtPayload {
    userId: number; // Adjust type based on your userId type
    username: string; // Add username to the payload interface
}

// Extend the Express Request interface
interface CustomRequest extends Request {
    userId?: number;  // Optional chaining for userId
    username?: string; // Optional chaining for username
}

export const verifyToken = (async(req: CustomRequest, res: Response, next: NextFunction) => {  
    // Check both cookie and Authorization header
    const cookieToken = req.cookies.token;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.split(' ')[1];
    
    const token = cookieToken || bearerToken;
    
    if (!token) {  
        return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });  
    }  

    try {  
        // Verify the token  
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;  

        // Check if decoded structure is as expected  
        if (decoded?.userId && decoded?.username) {  
            req.userId = decoded.userId;  
            req.username = decoded.username; // Attach username to the request object
            return next(); // Proceed to the next middleware
        } else {  
            return res.status(401).json({ success: false, message: "Unauthorized - invalid token payload" });  
        }  

    } catch (error: any) {  
        // Differentiating between different types of errors  
        if (error.name === 'TokenExpiredError') {  
            return res.status(401).json({ success: false, message: "Token expired" });  
        } else if (error.name === 'JsonWebTokenError') {  
            return res.status(401).json({ success: false, message: "Invalid token" });  
        }  

        console.error("Error in token verification: ", error);  
        return res.status(500).json({ success: false, message: "Server Error" });  
    }  
}) as express.RequestHandler;
