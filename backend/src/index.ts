import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import router from "./routes/auth.route";
import cookieParser from 'cookie-parser'
const prisma = new PrismaClient();

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173', // Replace with your React app's origin
    credentials: true,
}));

app.use('/api/auth',router)

app.get('/',async (req,res) => {
    res.send("bruh what")
})

app.listen(3116,() => {
    console.log("Running on port 3116")
})