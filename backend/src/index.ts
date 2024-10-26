import express from "express";
import UserModel from "./db";
import cors from "cors";
import router from "./routes/auth.route";
import cookieParser from 'cookie-parser'

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