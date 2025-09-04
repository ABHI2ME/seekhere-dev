import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config() ;

export const dbConnect = async () => {
     try{
        const conn = await mongoose.connect(process.env.MONGO_URI) ;
        console.log(`mongoose connected : ${conn.connection.host}`) ;
     }
     catch(error){
         console.log("error connecting to mongoDb" , error.message) ;
         process.exit(1) ;
     }
}





