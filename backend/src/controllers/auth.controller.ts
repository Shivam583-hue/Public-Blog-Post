import express, { Request, Response } from "express";
import zod from "zod";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail } from "../mailtrap/emails";

const ZodSchema = zod.object({
    username: zod.string(),
    email: zod.string(),
    password: zod.string(),
});
const Zod2Schema = zod.object({
    email: zod.string(),
    password: zod.string(),
});

function generateTokenAndSetCookie(res: any, userId: any,username: string) {
    const token = jwt.sign({ userId,username }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
    res.cookie("token", token, {
        httpOnly: false,
        secure: true,
        sameSite: "lax",
        maxAge: 15 * 24 * 60 * 60 * 1000, //15 days
    });
    return token;
};

// Generate verification code
export const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

export const signup = (async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    // Validate inputs
    const safeparse = ZodSchema.safeParse(req.body);
    if (!safeparse.success) {
        return res.send("Invalid Inputs");
    }

    // Check if user already exists
    const userAlreadyExists = await prisma.user.findUnique({ where: { email } });
    if (userAlreadyExists) {
        return res.send("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);


    // Create new user in Prisma
    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            username,
            verificationToken,
            verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
    });

    // JWT
    generateTokenAndSetCookie(res, user.id,user.username);

    // Send verification token to email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
        success: true,
        message: "User created successfully!",
        user: {
            ...user,
            password: undefined, // Hide the password
        },
    });
}) as express.RequestHandler;

export const signout = (async(req: Request, res: Response) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully!" });
})as express.RequestHandler

export const signin = (async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const parse = Zod2Schema.safeParse(req.body);

    if (!parse.success) {
        return res.status(400).json({ success: false, message: "Wrong input formats" });
    }

    try {
        // Find the user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found! Please sign up" });
        }

        // Check if the password is correct
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        // Generate token and set it as a cookie
        const token = generateTokenAndSetCookie(res, user.id, user.username);

        // Update last login timestamp
        await prisma.user.update({
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
    } catch (error) {
        console.error("Error in signin endpoint: ", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}) as express.RequestHandler;


export const verifyEmail = (async (req: Request, res: Response) => {
    const { code } = req.body;

    try {
        const user = await prisma.user.findFirst({
            where: {
                verificationToken: code,
                verificationTokenExpiresAt: { gt: new Date() },
            },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationToken: null,
                verificationTokenExpiresAt: null,
            },
        });

        // await sendWelcomeEmail(user.email, user.username);

        res.json({
            success: true,
            message: "The verify email endpoint works",
        });
    } catch (e) {
        console.log("error", e);
    }
}) as express.RequestHandler;

export const forgotPassword = (async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.json({ error: "User not found" });
        }

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpiresAt: resetTokenExpiresAt,
            },
        });

        await sendPasswordResetEmail(user.email, `https://public-blog-post.vercel.app/${resetToken}`);
        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (e: any) {
        console.log("Error in forgot password endpoint", e);
        res.status(400).json({ success: false, message: e.message });
    }
}) as express.RequestHandler;

export const resetPassword = (async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpiresAt: { gt: new Date() },
            },
        });

        if (!user) {
            return res.json({ Error: "User not found" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpiresAt: null,
            },
        });

        await sendResetSuccessEmail(user.email);
    } catch (error) {
        console.log("Error resetting Password", error);
    }
}) as express.RequestHandler;


export const checkAuth = (async (req: Request, res: Response) => {  
    try {  
        if (!req.userId) {  
            return res.status(401).json({ success: false, message: "Unauthorized - user not authenticated" });  
        }

        const user = await prisma.user.findUnique({ where: { id: req.userId } });  
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
    } catch (error) {  
        console.error("Error at the checkAuth endpoint:", error);  
        res.status(500).json({ success: false, message: "Internal server error" });  
    }  
}) as express.RequestHandler;

