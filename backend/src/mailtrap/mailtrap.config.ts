import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.API_KEY);

export const sender = {
  email: "hanniballector552@gmail.com",
  name: "Blugify",
};
