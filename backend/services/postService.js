import fs from 'fs/promises' ;
import Post from "../models/post.model.js";
import AppError from '../utils/appError.js';
import sanitizeHtml from 'sanitize-html';
import { uploadLocalToCloudinary } from '../libs/cloudinary.js';


export const createNewPost = async (req , {text , userId}) => {

  console.log("my text is " , text) ;
  
  const cleanContent = sanitizeHtml(text || "", {
    allowedTags: [],       // no HTML tags
    allowedAttributes: {}, // strip attributes like onclick=""
  });

   if (!cleanContent) {
    throw new AppError("Post must have valid text.", 400, "ValidationError");
  }

     let media = [] ;
      if(req.file){
        const imageURL = await uploadLocalToCloudinary(req.file.path ,"post") ;
        if(!imageURL){
           throw new AppError("error uploading image to cloudinary" , 500 , "cloudinary error");
        }
        media.push({
        url : imageURL.secure_url , 
        public_id : imageURL.public_id, 
        type : "image",
       })
       await fs.unlink(req.file.path);
      }
     
    
     
  return await Post.create(
    {
      content:cleanContent ,
      userId, 
      media ,
    }
  );
};

export const getRecentPosts = async ({cursor , limit}) => {
    
   const query  = {} ;
   if(cursor){
      query._id = { $lt : cursor } ;
   }

   const posts = await Post.find(query)
        .sort({_id : -1})
        .limit(limit+1)
        .lean()

   let nextCursor = null ;

   if(posts.length > limit){
      nextCursor = posts[limit]._id ;
      posts.pop() ;
   }

   return {posts , nextCursor} ;

}

export const getPostWithComments  = async (postId) => {
  return await Post.findById(postId).lean();
};

export const deletePostById  = async (postId) => {
     return await Post.findByIdAndDelete(postId);
} ;

export const findPostById = async (postId) => {
     return await Post.findById(postId);
} ;
