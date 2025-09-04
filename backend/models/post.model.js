import mongoose from "mongoose";
import { minLength } from "zod";

const postSchema= new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Refers to Users collection
      required: true,
      index: true, 
    },
    content: {
      type: String,
      required: true,
      trim: true,
      minLength : [1 , "content must not be blank"] ,
      maxlength: [500 , "content must be 500 characters long at max"] , 
    },
    media: [
      {
        url: { type: String }, 
        public_id : {type: String} ,
        type: { type: String, enum: ["image", "video", "gif"], default: "image" },
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },

    tags: [{ type: String, index: true }],
  } ,
  {
    timestamps: true ,
  } 
) ;

const Post = mongoose.model("Post" ,postSchema) ; 

export default Post ;