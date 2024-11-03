import express from "express";
import { signin,signout,signup,verifyEmail,forgotPassword,resetPassword,checkAuth } from "../controllers/auth.controller"
import zod from "zod";
import { verifyToken } from "../middleware/verifiyToken";



const router = express.Router();

router.get('/check-auth',verifyToken, checkAuth)

router.post('/signup',signup)

router.post('/signin', signin)

router.post('/signout',signout)

router.post("/verify-email",verifyEmail);

router.post("/forgot-password",forgotPassword)

router.post("/reset-password/:token",resetPassword)
export default router