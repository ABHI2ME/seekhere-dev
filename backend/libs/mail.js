import nodemailer from 'nodemailer' ;
import dotenv from 'dotenv' ;
dotenv.config() ;

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET ,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    // accessToken: "ya29.Xx_XX0xxxxx-xX0X0XxXXxXxXXXxX0x",
    // expires: 1484314697598,
  },
});

export default transporter ;