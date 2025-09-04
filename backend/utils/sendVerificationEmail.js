import dotenv from 'dotenv' ;
import transporter from '../libs/mail.js';
import { verificationCodeEmailTemplate } from '../libs/emailTemplates/verificationCodeHtml.js';
dotenv.config() ;

const sendEmailVerificationCode = async (code, email) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Verify your account",
      text: `Verify your email`,
      html: verificationCodeEmailTemplate(code),
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export default sendEmailVerificationCode ;