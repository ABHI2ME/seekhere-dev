import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv' ;
dotenv.config() ;

let prisma = null ;

if(process.env.NODE_ENV === "production"){
     prisma = new PrismaClient() ;
}else{
    if(!global.prsiam){
        global.prisma = new PrismaClient() ;
    }
    prisma = global.prisma ;
}

export default prisma ;