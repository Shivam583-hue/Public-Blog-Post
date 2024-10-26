import mongoose from "mongoose"
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Failed to connect to MongoDB", err));

const UserSchema = new mongoose.Schema({
    username : {type : String, required : true},
    email : {type : String, required : true},
    password : {type : String, required : true},
    lastLogin : {type: Date, default: Date.now},
    isVerified : {type : Boolean, default: false},
    resetPasswordToken : String,
    resetPasswordExpiresAt : Date,
    verificationToken  : String,
    verificationTokenExpiresAt : Date,
},{timestamps:true})

const UserModel = mongoose.model("NotesModel",UserSchema)
export default UserModel; 