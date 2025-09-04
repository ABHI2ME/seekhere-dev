import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config() ;

const generateTokens = async (userId) =>{
    const accessToken =  jwt.sign({userId} , process.env.ACCESS_TOKEN_SECRET , {
         expiresIn: "15m" ,
    } ) ;

    const refreshToken = jwt.sign({userId} , process.env.REFRESH_TOKEN_SECRET , {
        expiresIn : "7d" ,
    }) ;

    
    return {accessToken , refreshToken} ;

}

export default generateTokens ;