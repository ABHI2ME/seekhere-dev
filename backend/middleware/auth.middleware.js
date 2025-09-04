import jwt from 'jsonwebtoken' ;
import User from '../models/user.model.js';
import dotenv  from 'dotenv';
dotenv.config() ;

const protectRoute = async (req,  res , next)=>{
   try {
     const accessToken = req.cookies?.accessToken ;
     if(!accessToken) {
        res.status(401).json({message : "un-authorized access : no token provided"}) ;
     }

     try {

        const decoded = await  jwt.verify(accessToken , process.env.ACCESS_TOKEN_SECRET) ;
        const user = await User.findById(decoded.userId).select("-password") ;
        console.log("my user is" , user) ;
        req.user = user ;
        next() ;

     } catch (error) {
            if (error.name === "TokenExpiredError") {
				return res.status(401).json({ message: "Unauthorized - Access token expired" });
			}
			throw error;
     }
     
   } catch (error) {
       console.log("error in protectRouteMiddleware : ", error.message) ;
       return res.status(401).json({message : "Unauthorized : invalid access token"}) ;
   }

}

export default protectRoute ;
