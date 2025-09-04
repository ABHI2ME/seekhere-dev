import jwt, { decode } from "jsonwebtoken" ;
import client from "../libs/redis.js";
import signupValidation from "../libs/validateInput.js";
import User from "../models/user.model.js";
import {generateVerificationCode, verifyOtp} from "../utils/generateAndStoreOtp.js";
import generateTokens from "../utils/generateTokens.js";
import dotenv from "dotenv" ;
dotenv.config() ;

import setCookieToken from "../utils/setCookieToken.js";
import storeRefreshToken from "../utils/storeRefreshToken.js";
import generateOtpSessionId from "../utils/generateOtpSessionId.js";
import sendEmailVerificationCode from "../utils/sendVerificationEmail.js";



export const Signup = async (req , res) =>{
     
     try {
          
          const validateData = signupValidation.safeParse(req.body);
           if (!validateData.success) {
               // Return all Zod validation errors
               return res.status(400).json({
               errors: validateData.error.format(),
               });
            }
          
          const {username , password} =  validateData.data ;
          const email  = validateData.data.email.toLowerCase() ;
          
       

          // const key = `coolDownOtp:${String(email).toLocaleLowerCase()}` ;
          // const cooldownUser = await client.exists(key) ;
          // if(cooldownUser){
          //      return res.status(400).json({message:"the user is in cooldown period"}) ;
          //      // will give toaster or redirect to verify-otp page with remaining time
          // }
          const existingUsername = await User.findOne({username}) ;
          if(existingUsername){
               return res.status(400).json({message : "the username is already taken"}) ;
          }

          const UserExisting = await User.findOne({email}) ;

          if(UserExisting){
               const emailVerification = UserExisting.isVerified ;
               if(!emailVerification){
                     // will redirect the user to enter the otp page on frontend 
                    return res.status(400).json({message : "the user is not verified for email"}) ;
                     
               }
               else{
                    return res.status(400).json({message: "user already exists"}) ;
               }
 
          }



          
          const user = await  User.create({
               username ,
               email ,
               password ,
               verificationExpiry : new Date(Date.now() + 2*24*60*60*1000) 
               
               }) ;

          await generateOtpSessionId(res , email) ; // created to get the email on the page of /verify-otp from cookie-session
          const verificationCode = await generateVerificationCode(email) ;
          await sendEmailVerificationCode(verificationCode , email) ;


          return   res.status(201).json({
               _id : user._id , 
               name : user.username , 
               email : user.email , 
          })
     } catch (error) {
              console.log("error in signup controller" , error.message) ;
              return res.status(500).json({message : error.message}) ;
     }  
} ;

export const Login = async (req , res) =>{
     try{
         const {email  , password} = req.body ;
         
         const user = await User.findOne({email}) ;
         if(!user){
            return res.status(401).json({ success : false , message : "invalid credentials"})
         }

         const isMatch = await user.comparePassword(password);
         if(!isMatch){
             return res.status(401).json({ success : false , message : "invalid credentials"})
         }

          const {accessToken , refreshToken} = await generateTokens(user._id) ;
          await storeRefreshToken(user._id , refreshToken) ; 
          await setCookieToken(accessToken, refreshToken  , res) ;

          return res.status(201).json({success : true , message:"login successfull"}) ;

     }catch(error){
         console.log("error in login funtion ", error.message) ;
         res.status(400).json({success : false , message : "error in logging in"}) ;
     }
} ;

export const refershAccessToken = async (req ,res) =>{
     try {
          const rawToken = req.cookies.refreshToken ;
          if(!rawToken){
               return res.status(401).json({success : false , message : "token expired "}) ;
          } ;

          const decoded = await jwt.verify(rawToken , process.env.REFRESH_TOKEN_SECRET) ;
          const storedToken = await client.get(`refresh_token:${decoded.userId}`) ;

          if(storedToken !== rawToken){
               return res.status(400).json({sucess : false , message : "invalid token"}) ;
          }

          const accessToken = jwt.sign({userId :decoded.userId }, process.env.ACCESS_TOKEN_SECRET , {
               expiresIn: "15m" ,
          }) ;

           res.cookie("accessToken" , accessToken , {
           httpOnly : true ,
           secure: process.env.NODE_ENV === "production" ,
           sameSite:"strict" ,
           maxAge: 15*60*1000

          });

           res.json({message : "the token refreshed successfully"}) ;

     } catch (error) {
          console.log("error in refresh token automatically " ,error.message) ;
          res.status(400).json({success : false , message : "server error " + error.message}) ;
     }
}

export const VerifyOtpByUser = async(req , res) => {
      verifyOtp(req , res);
}


export const Logout = async (req , res) =>{
     try {
          const refreshToken = req.cookies.refreshToken ;
          const accessToken = req.cookies.accessToken ;
          
          const decoded =  await jwt.verify(refreshToken , process.env.REFRESH_TOKEN_SECRET);
          const userId = decoded.userId ;

          await client.del(`refresh_token:${userId}`) ;
          res.clearCookie("refreshToken" , {
               httpOnly : true , 
               secure : process.env.NODE_ENV === "production" , 
               sameSite : "strict" 

          }) ;

          res.clearCookie("accessToken" , {
                httpOnly : true , 
                secure : process.env.NODE_ENV === "production" , 
                sameSite : "strict"  
          })

          res.status(200).json({success : true , message :"logout successfully"}) ;

     } catch (error) {
           console.log("error in logout code block " , error.message) ;
           res.status(400).json({sucess : false , message : "error in logging out"}) ;
     }
} ;

export const resetPassword = async (req , res) =>{
     
} ;
