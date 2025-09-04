import express from 'express' ;
import protectRoute from '../middleware/auth.middleware.js';
import { createCommentReplies, createFirstLevelComments, createPost, deletePost, getAllPosts, getPostById, getRepliesByCommentId, LikePostByUSer } from '../controller/post.controller.js';
import createUpload from '../middleware/multer.middleware.js';
import inputValidation from '../middleware/inputValidation.js';

const router = express.Router() ;

const postUpload = createUpload({
  folder: "../public/uploads/posts",
  allowedTypes: ["jpeg", "jpg", "png", "webp","gif"],
  MIMETypes : ["image/jpeg", "image/png", "image/gif", "image/webp"],
  maxSize: 5 * 1024 * 1024,
});

router.post('/' , protectRoute , postUpload.single("image") , createPost) ;
//frontend url will look like GET /api/posts?page=1&limit=20
router.get('/' , getAllPosts) ;
router.get('/:postId/comments' , getPostById) ;
router.delete('/:postId', protectRoute , deletePost) ;
router.get('/:postId/comments/:commentId/replies' , getRepliesByCommentId) ;
router.post('/:postId/comments' , protectRoute , inputValidation(250) , createFirstLevelComments) ;
router.post('/:postId/comments/:commentId' , protectRoute , inputValidation(200) ,createCommentReplies) ;
router.post('/:postId/like' , protectRoute , LikePostByUSer) ;

export default router ;

