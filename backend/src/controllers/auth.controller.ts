import express,{Request,Response} from "express";
import zod from "zod";
import bcryptjs from "bcryptjs"
import crypto from "crypto";
import jwt from "jsonwebtoken"

import UserModel from "../db";
import dotenv from 'dotenv';
dotenv.config();

import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails";


const ZodSchema = zod.object({
    username : zod.string(),
    email : zod.string(),
    password : zod.string(),
})
const Zod2Schema = zod.object({
    email : zod.string(),
    password : zod.string(),
})

function generateTokenAndSetCookie(res : any,userId : any){
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn: "7d",
    })
    res.cookie("token",token,{
        httpOnly: true,
        secure : true,
        sameSite: "lax",
        maxAge: 15 * 24 * 60 * 60 * 1000, //15 days
    })
    return token;
};


export const signup = (async (req: Request, res: Response) => {
    const { username, email, password } = req.body;

    // Validate inputs
    const safeparse = ZodSchema.safeParse(req.body);
    if (!safeparse.success) {
        return res.send("Invalid Inputs");
    }

    // Check if user already exists
    const userAlreadyExists = await UserModel.findOne({ email });
    if (userAlreadyExists) {
        return res.send("User with this email already exists");
    }

    // Hash password
    const hashedpassword = await bcryptjs.hash(password, 10);

    // Generate verification code
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Create new user model
    const user = new UserModel({
        email,
        password: hashedpassword,
        username,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Saving the instance to the database
    await user.save();

    // JWT
    generateTokenAndSetCookie(res, user._id);

    // Send verification token to email
    await sendVerificationEmail(user.email, verificationToken);

    // Convert to plain object and respond
    const userObject = user.toObject(); // Safely convert Mongoose document

    res.status(201).json({
        success: true,
        message: "User created successfully!",
        user: {
            ...userObject,
            password: undefined, // Hide the password
        },
    });
})as express.RequestHandler;


export function signout (req:Request,res:Response){
    res.clearCookie("token")
    res.status(200).json({success : true, message: "Logged out successfully!"})
}
export const signin = (async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const parse = Zod2Schema.safeParse(req.body);

    if (!parse.success) {
        return res.status(400).json({ message: "Wrong Input Formats" });
    }

    try {
        // Find the user by email
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found! Please Signup" });
        }

        // Check if the password is correct
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect Password" });
        }

        // Generate token and set it as a cookie
        generateTokenAndSetCookie(res, user._id);

        // Update last login timestamp
        user.lastLogin = new Date();
        await user.save();

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
    } catch (e) {
        console.error("Error: ", e);
        res.status(500).json({ message: "Internal server error" });
    }
}) as express.RequestHandler;


export const verifyEmail = (async(req:Request,res:Response) => { 
    const {code} = req.body;
    
    try{
       const user = await UserModel.findOne({
           verificationToken : code,
           verificationTokenExpiresAt : {$gt: Date.now()}
       })
       if(!user){
           return res.status(400).json({success : false, message: "Invalid or expired verification code"})
       }
       user.isVerified = true;
       user.verificationToken = undefined;
       user.verificationTokenExpiresAt = undefined;
       await user.save();

       await sendWelcomeEmail(user.email,user.username)

       res.json({
           success : true,
           message : "The verify email endpoint works"
       })

    }catch(e){console.log("error",e);}
})as express.RequestHandler

export const forgotPassword = (async(req:Request,res:Response) => {
   const {email} = req.body;
   try{
       const user = await UserModel.findOne({email})
       if(!user){
           return res.json({error : "User not found"})
       }

       //Generate a reset password response token
       const resetToken = crypto.randomBytes(20).toString("hex");
       const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

       user.resetPasswordToken = resetToken;
       user.resetPasswordExpiresAt = resetTokenExpiresAt;
       await user.save()

       //send email
       await sendPasswordResetEmail(user.email,`http://localhost:5173/reset-password/${resetToken}`)
       res.status(200).json({success:true,message:"Password reset link sent to your email"})
   }catch(e:any){
    console.log("Error in forgot password endpoint", e)
    res.status(400).json({success:false,message:e.message})
    }
})as express.RequestHandler

export const resetPassword = (async(req:Request,res:Response)=> {
    try {
        const {token} = req.params;
        const {password} = req.body;
        const user = await  UserModel.findOne({
            resetPasswordToken:token, 
            resetPasswordExpiresAt: {$gt : Date.now()}})

        if(!user){
            return res.json({Error : "User not found"})
        }

        //update password 
        const hashedpassword = await bcryptjs.hash(password,10);
        user.password = hashedpassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt =  undefined;
        await user.save();

        //sending reset email successfull email
        await sendResetSuccessEmail(user.email);
    } catch (error) {
        console.log("Error resetting Password",error);
    }
})as express.RequestHandler

export const checkAuth = (async(req:any,res:Response) => {
    try {
        const user = await UserModel.findById(req.userId)
        if(!user){
            return res.status(400).json({success : false, message : "User not found!"})
        }
    } catch (error) {
        console.log("Error at the checkAuth endpoint", error)
    }
})as express.RequestHandler

