import crypto from 'crypto' ;
import client from '../libs/redis.js';
const generateOtpSessionId = async (res ,  email) => {
    try {
        const otpSessionId = await crypto.randomBytes(18).toString("hex") ;
        await client.set(`otpSessionId:${otpSessionId}`, email , "EX" , 4*60*60) ;

        res.cookie("otp_sid"  , otpSessionId , {
            httpOnly : true , 
            secure : process.env.NODE_ENV === "production" , 
            sameSite : 'Strict' , 
            maxAge : 4*60*60*1000 ,  
            // path : "/verify-otp"
        }) ;

    } catch (error) {
        console.log( "error in generateOtpSessionId code block ", error.message) ;
    }

} ;

export default generateOtpSessionId ;