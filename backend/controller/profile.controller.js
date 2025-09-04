import { success } from "zod";
import { deleteFromCloudinary, uploadLocalToCloudinary } from "../libs/cloudinary.js";
import fs from 'fs/promises' ;
import User from "../models/user.model.js";


export const GetInfo = async (req , res) => {
    try {
        const user = req.user ;
        console.log("user is " , user);
        res.status(200).json(
            {
                message : "success"  , 
                user : {
                    username : user.username , 
                    email: user.email , 
                    bio : user.bio,  
                    favouriteMovies : user.favouriteMovies , 
                    favouriteAnime : user.favouriteAnime ,
                    profilePic : user.profilePic , 
                    isVerified : user.isVerified , 
                    posts : user.posts 
                }
            }
        )
    } catch (error) {
        console.log("error in profile section to get user info " , error.message) ;
        res.status(401).json({message : "failed to get user info "}) ;
    }
}

export const UpLoadProfilePic = async (req , res , next) =>{
     try {
        if(!req.file){
            return res.status(400).json({error : "No file uploaded"}) ;
        }
        const localPath = req.file.path ;

        const user = req.user ;
        
        if (user.profilePic.url && user.profilePic.public_id) {
          await deleteFromCloudinary(user.profilePic.public_id) ;
        }

        const result = await uploadLocalToCloudinary(localPath , "profile") ;
        await fs.unlink(localPath) ;

        user.profilePic = {
        url: result.secure_url, 
        public_id: result.public_id,
        };
        await user.save() ;
        
        res.json({success : true , message : "profile pic uploaded successfully"}) ;
        // console.log("the public url is " , result.secure_url) ;

        
     } catch (error) {
        console.log("error while uploading file to cloudinary " , error.message) ;
        next(error) ;
     }
}

export const UploadBio = async (req, res) => {
    try {
        const {userBio} = req.body ;
        const user = req.user ;
        await User.findByIdAndUpdate(user._id , {bio : userBio} ,{ new: true }) ;
        res.status(200).json({success:true , message : "bio updated successfully"}) ;

        
    } catch (error) {
        console.log("error in bio section " , error.message) ;
        res.status(400).json({success:false  , message : "errro in  bio updation"}) ;
    }
}