import express from 'express' ;
import protectRoute from '../middleware/auth.middleware.js';
import { GetInfo, UploadBio, UpLoadProfilePic } from '../controller/profile.controller.js';
import createUpload from '../middleware/multer.middleware.js';


const router = express.Router() ;

const profileUpload = createUpload({
  folder: "../public/uploads/profile",
  allowedTypes: ["jpeg", "jpg", "png", "webp"],
  MIMETypes : ["image/jpeg", "image/png","image/webp"],
  maxSize: 2 * 1024 * 1024,
});

router.get('/' ,protectRoute ,  GetInfo) ;
router.post('/upload', protectRoute , profileUpload.single("image"), UpLoadProfilePic) ;
router.put('/bio' ,protectRoute ,UploadBio) ;
// router.get('/friends' ,protectRoute ,GetFriends) ;
// router.get('/favourites' ,protectRoute ,getFavourites) ;

export default router ;