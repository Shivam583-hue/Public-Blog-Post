import {PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE} from "./emailTemplates"
import { sender } from "./mailtrap.config"
import sgMail from '@sendgrid/mail';


export const sendVerificationEmail = async  (email : string,verificationToken : string) => {
    const recipient = [{email}];

    try{
        const response = await sgMail.send({
            from: sender,
            to: recipient,
            subject: "Verifiy your Email",
            html : VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}",verificationToken),
            category : "Email Verification"
        })
        console.log("Email sent successfully",response);
    }catch(e){console.log("Error",e)}
}

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

export const sendPasswordResetEmail = async(email:any,resetURL:any) =>{
    const recipient = [{email}];

    try{ 
        const response = await sgMail.send({
            from : sender,
            to : recipient,
            subject : "Reset your password",
            html : PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}",resetURL)
        })
    }catch(e){console.log("Error in sending email", e)}
}

export const sendResetSuccessEmail = async(email:any) => {
    const recipient = [{email}]
    try {
        const response = await sgMail.send({
            from : sender,
            to : recipient,
            subject : "Password Reset successfull",
            html : PASSWORD_RESET_SUCCESS_TEMPLATE ,
            category : "Password Reset"
        })
        console.log("Password Reset Successfully")
    } catch (error) {
        console.log("Failed to send password reset successful email",error)
    }
}