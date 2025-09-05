import * as postService from '../services/postService.js' ;
import User from '../models/user.model.js';
import prisma from '../libs/prisma.js';
import mongoose from 'mongoose';
import fs from 'fs' ;
import {v4 as uuid} from 'uuid' ;
import AppError from '../utils/appError.js';
import Post from '../models/post.model.js';
import { sendPostLike } from '../services/kafkaService/kafkaProducer.js';
import redisClient from '../libs/redisDocker.js';


export const createPost = async (req , res, next) => {
     
     try {
         const {text} = req.body ;
         console.log("my text inside controller is " , text) ;
         const userId = req.user._id ;
         const post = await postService.createNewPost( req , {text , userId}) ;
         
         const filteredPost = {
             postId : post._id , 
             content : post.content , 
             media : post.media.map(e => ({
                        url : e.url , 
                        type : e.type , 
                     })) , 
             likesCount : post.likesCount , 
             commentsCount : post.commentsCount , 
             tags    : post.tags , 
             createdAt : post.createdAt , 
             updatedAt : post.updatedAt
          }
         return res.status(201).json({success : true , message : "post created successfully" , data : filteredPost}) ;
     } catch (error) {
         if (error.name === "ValidationError") {
         return res.status(400).json({
         success: false,
         message: error.message, // "content is longer than 500 chars or blank"
       });
    }
        next(error) ;
}
} ;

export const getAllPosts = async (req, res) => {
  try {
    // offset pagination
    // const page = parseInt(req.query.page) || 1 ;
    // const limit = parseInt(req.query.limit) || 20 ;

    // if(limit > 50 ){
    //     limit = 50 ;
    // }

    // const posts = await postService.getRecentPosts(limit , (page-1)*limit);
    
    let {cursor , limit} = req.query ;

    limit = Math.min(parseInt(limit , 10) || 20 , 50) ;

    if(cursor && !mongoose.Types.ObjectId.isValid(cursor)){
        return res.status(400).json({success : false , message : "invalid cursor"}) ;
    }

    const {posts , nextCursor} = await postService.getRecentPosts({
       cursor , 
       limit : parseInt(limit , 10),
    })
    //making array for all postIds 
    const postIds = posts.map((e) => e._id.toString()) ;
    const pipeline =  redisClient.pipeline() ;
    postIds.map((e) => pipeline.get(`post:${e}:likes`)) ;

    const redisResults = await pipeline.exec() ;
    // getting all available counts of like for post from redis 
    const redisCounts = redisResults.map(([err,val]) => (val !== null) ? parseInt(val ,10) : null ) ;
    // find missing postIds 
    const missingPostIds = postIds.filter((e , i)=> redisCounts[i] === null) ;
    let dbCounts = [] ;

    if(missingPostIds.length > 0){
       const rows = await prisma.PostLikesCount.findMany({
            where : {postId : {in : missingPostIds}} ,
            select : {postId :true  , count : true} , 
       }) ;
       // making look-up table for postId : count for missing postIds in redis 
       dbCounts = Object.fromEntries(rows.map((e) => [e.postId.toString() , e.count])) ;
    }


   
    const userIds = [...new Set(posts.map(p => p.userId.toString()))];

    const users = await User.find({ _id: { $in: userIds } })
                            .select("_id username profilePic")
                            .lean();

    const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

    // Construct DTO response
    const response = posts.map(p => ({
      ...p,
      user: userMap[p.userId.toString()] || null,
    }));

    

    const filtredResponse = response.map((data , i) => {
        const redisCount = redisCounts[i] ;
        const dbCount = dbCounts[data._id.toString()] ?? 0 ;
        return {
          postId : data._id , 
          content : data.content , 
          media : data.media.map(e => ({
                        url : e.url , 
                        type : e.type
                  })) , 
          likesCount : redisCount ?? dbCount , 
          commentsCount : data.commentsCount , 
          createdAt : data.createdAt , 
          updatedAt : data.updatedAt , 
          user : {
                    username : data.user.username , 
                    profilePic : data.user.profilePic.url ,
                  }
        }
    }) ;

    return res.json({ success: true, data: filtredResponse , nextCursor });
  } catch (error) {
    console.error("getPosts error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPostById = async (req, res , next) => {
  try {
    const { postId } = req.params;
    let {cursor  , limit=10}   = req.query ;
    
    console.log("my cursor in getPostById is " , cursor) ;
    console.log("my postid is ", postId);

    const post = await postService.getPostWithComments(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    // Resolve user separately
    const user = await User.findById(post.userId).select("_id username profilePic ").lean();
    limit = parseInt(limit , 10) || 10 ;
    cursor = parseInt(cursor , 10) || null ;
    if (isNaN(limit) || limit <= 0 || limit > 20) limit = 20;
    
    // const comments = await Comment.find({ postId }).sort({ createdAt: -1 }).lean();
    const comments = await prisma.comment.findMany({
         where : {postId : String(postId) , parentId : null} ,
         orderBy : {createdAt : "desc"} ,
         ...(cursor && {cursor : {id : cursor} , skip : 1}) ,  
         take : limit + 1 , 

    }) ;

    const hasMore = comments.length > limit ;
    const results = hasMore ? comments.slice(0 , limit) : comments ;

    console.log("comments are " , comments) ;
    let redisCount = await redisClient.get(`post:${post._id.toString()}:likes`) ;
    redisCount = redisCount !== null ? parseInt(redisCount , 10) : null ;  

    let dbCount = null ;
    if(!redisCount){
        const row =  await prisma.PostLikesCount.findUnique({
             where: {postId : post._id.toString()} , 
             select : {count: true}
        })
        dbCount = row?.count ?? 0
    } ;


    return res.json({
      success: true,
      data: {
        postId : post._id , 
        content : post.content , 
        media : post.media.map((e) => ({
                  url : e.url ,
                  type : e.type ,
                })) ,
        likesCount : redisCount ?? dbCount.count , 
        commentsCount : post.commentsCount , 
        tags   : post.tags , 
        createdAt : post.createdAt , 
        updatedAt : post.updatedAt , 
        user : {
             username :user.username , 
             profilePic :user.profilePic.url , 
        } ,
        results ,
        hasMore , 
        nextCursor : hasMore ? results[results.length -1].id : null  
      },
    });
  } catch (error) {
    console.error("getPostWithComments error:", error);
    next(error) ;
  }
}

export const deletePost = async (req , res) => {
    try {
        const {postId} = req.params ;
    
      const post = await postService.findPostById(postId) ;
      if(!post){
        return res.status(400).json({success : false , message : "the post does not exists"}) ;
      }
      if(post.userId.toString() !== req.user._id.toString()){
         return res.status(400).json({success : false , message : "you are not allowed to delete this post"}) ;
      }
      
      // :( i think i need here some transaction type of code but two different types of databases , doomed !!!
      const response = await postService.deletePostById(postId) ;

      await prisma.comment.deleteMany({
           where : {
               postId : String(postId) ,
           }
      })

      return res.json({ success: true, message : "post deleted successfully"}) ;
    } catch (error) {
        console.log("error in deletepost by id in controller " , error.message) ;
        res.status(500).json({success : false , message : "server error"}) ;
    }

}

export const getRepliesByCommentId = async (req , res ,  next) => {
   try {
      const {postId , commentId } =  req.params ;
      let {cursor , limit} = req.query ;

      // const postExists =  await Post.findById(id) ;
      // if(!postExists){
      //     throw new AppError("the error in postId", 501, "server error") ;
      // }
      
      const parentCommentExists = await prisma.comment.findFirst({
         where : {
             id : Number(commentId) , 
             postId: String(postId) 
         }
      }) ;
      if(!parentCommentExists){
          throw new AppError("commentId does not exists" , 404 , "comment not found") ;
      }
      
      limit = parseInt(limit , 10) || 10 ;
      if(isNaN(limit) || limit < 1 || limit > 10) limit = 10 ;

      

      const comments = await prisma.comment.findMany({
          where : {
              parentId : Number(commentId)  
          } ,
          orderBy : [{createdAt : 'desc'} , {id : "desc"}] ,
          ...(cursor ? {cursor : {id : Number(cursor)} , skip :1 } : {}) , 
          take : limit+1 , 
          select : {
             id : true , 
             userName : true , 
             comment : true
          }
      }) ; 
      const hasMore = comments.length > Number(limit) ;
      const results = hasMore ? comments.slice(0 , limit) : comments ;

      return res.json({
         success : true , 
         data : {
              results , 
              hasMore , 
              nextCursor : hasMore ? results[results.length-1].id : null 
         }
      })

   } catch (error) {
      next(error) ;
   }
} ;

export const createFirstLevelComments = async (req, res , next) => {
      try {
          const {postId} = req.params ;
          const {text} = req.body ;

          const user = req.user ;



          const postExists = await Post.findById(postId) ;
          if(!postExists){
              throw new AppError("the post doesn't exists",404,"post not found") ;
          }

          const comment = await prisma.comment.create({
              data : {  
                        userName : user.username ,
                        comment : String(text) , 
                        postId : String(postId) ,
                        commentorId : user._id.toString() , 
                        parentId : null , 
                        createdAt : new Date() , 
                     }
          }) ;
          console.log("user created the comment ",comment) ;
          res.json({sucess : true , message : "commented successfully" , data:comment }) ;

          
      } catch (error) {
          console.log("error in createFirstLevelCommet ", error) ;
          next(error) ;
      }
} ;

export const createCommentReplies = async (req , res , next ) => {
       try {
            const {postId , commentId} = req.params ;
            const {text} = req.body ;
            const user = req.user ;
            
            const postExists = await Post.findById(postId) ;
            if(!postExists){
                throw new AppError("the post doesn't exists",404,"post not found") ;
            }

            const commentExists = await prisma.comment.findUnique({
                where : {
                           id : Number(commentId),
                        } 
            }) ;
            if(!commentExists){
                 throw new AppError("the comment doesn't exists",404,"comment not found") ;
            }

            const reply = await prisma.comment.create({
                data : {
                           userName : user.username , 
                           postId : String(postId) ,
                           comment : String(text) ,
                           commentorId : String(user._id) ,
                           parentId : Number(commentId) ,
                           createdAt :  new Date() 
                       }
            })

            res.json({
               sucess : true , 
               message : "replied to comment successfully", 
               data : reply
            })


       } catch (error) {
          console.log("error in createCommnentREplies " ,  error) , 
          next(error) ;
       }
} ;

export const LikePostByUSer = async (req , res , next) => {
    try {
     const postId = req.params.postId ;
     const user = req.user ;
     let {action} = req.body ;
     action = String(action) ;
     console.log("*****************************" , action) ;

    const postExists = await Post.findById(postId) ;
    if(!postExists){
       return next(new AppError("post doesn't exists" , 404 , "post not found")) ;
    }
    const allowedActions = ['UNLIKE' , 'LIKE'] ;
    if(!allowedActions.includes(action)){
       return next(new AppError('invalid action specified' , 400 , "not permiited")) ;
    }
      
     

await sendPostLike({
   eventId : uuid() , 
   postId , 
   userId : user._id , 
   action : action === 'UNLIKE' ? 'UNLIKE' : 'LIKE' , 
   ts : Date.now()
})

   res.status(202).json({ status: 'success' , message : "message is queued"}); 
    } catch (error) {
        next(error) ;
    }

} ;

