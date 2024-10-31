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
exports.sendResetSuccessEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const emailTemplates_1 = require("./emailTemplates");
const mailtrap_config_1 = require("./mailtrap.config");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const sendVerificationEmail = (email, verificationToken) => __awaiter(void 0, void 0, void 0, function* () {
    const recipient = [{ email }];
    try {
        const response = yield mail_1.default.send({
            from: mailtrap_config_1.sender,
            to: recipient,
            subject: "Verifiy your Email",
            html: emailTemplates_1.VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification"
        });
        console.log("Email sent successfully", response);
    }
    catch (e) {
        console.log("Error", e);
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
// export const sendWelcomeEmail = async (email: any, username : any) => {
//     const recipient = [{email}];
//     try{
//         await sgMail.send({
//             from : sender,
//             to : recipient,
//             template_uuid: "4bd70e73-64bd-4e84-a08d-920729ecc2bb",
//             template_variables: {
//                 "company_info_name": "Kwisatz Haderach's Followers",
//                 "name": username 
//               }
//         })
//         console.log("Welcome Email sent  ")
//     }catch(e){console.log("Error : " ,e)}
// }
const sendPasswordResetEmail = (email, resetURL) => __awaiter(void 0, void 0, void 0, function* () {
    const recipient = [{ email }];
    try {
        const response = yield mail_1.default.send({
            from: mailtrap_config_1.sender,
            to: recipient,
            subject: "Reset your password",
            html: emailTemplates_1.PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL)
        });
    }
    catch (e) {
        console.log("Error in sending email", e);
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendResetSuccessEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const recipient = [{ email }];
    try {
        const response = yield mail_1.default.send({
            from: mailtrap_config_1.sender,
            to: recipient,
            subject: "Password Reset successfull",
            html: emailTemplates_1.PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset"
        });
        console.log("Password Reset Successfully");
    }
    catch (error) {
        console.log("Failed to send password reset successful email", error);
    }
});
exports.sendResetSuccessEmail = sendResetSuccessEmail;
