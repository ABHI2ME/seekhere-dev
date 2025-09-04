import mongoose from "mongoose";
import { BlockList } from "net";
import { type } from "os";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
 
  username: {
    type:String,
    unique:true,
    required : [true , "username is required"]
  },
  role: {
    type : String , 
    enum : ["admin" , "user"]  ,
    default : "user" , 
  } ,
  bio: {
    type : String
  } , 
  profilePic: {
    url: { type: String },
    public_id: { type: String } 
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim : true,
    lowercase : true 
  },
  password: {
    type: String,
    required: [true ,"password is required"],
    minlength : [8 , "Password must be eight characrters long"]

  },
  provider: {
    type: String,
    enum: ['manual', 'google'],
    default: 'manual',
  },
  googleId: {
    type: String,
  },
  verification_code: Number,
  expiryVerification_code: Date,
  isVerified : {
    type : Boolean , 
    default : false
  } ,
  tokens: [String], // Array of access/refresh tokens
  favouriteMovies: [String], // Array of movie IDs
  favouriteAnime: [String],  // Array of anime IDs
  posts: [String], // Array of post IDs
  friends_id: [{
    type:mongoose.Schema.Types.ObjectId, 
    ref: "Friends"
  }] ,   // References to other users

  verificationExpiry: { type: Date, index: { expires: 0 } }, // TTL to remove unverified users after 2 dyas 

  created_at: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save" , async function(next) {
    if(!this.isModified("password")) return next() ;
    try {
       const salt = await bcrypt.genSalt(10) ;
       this.password = await bcrypt.hash(this.password , salt) ;
       next() ;
    } catch (error) {
       next(error) ;
    }
}) ;

userSchema.methods.comparePassword = async function(enteredPassword){
   return await bcrypt.compare(enteredPassword , this.password) ;
} ;




const User = mongoose.model("User" , userSchema ) ;


export default User ;
    