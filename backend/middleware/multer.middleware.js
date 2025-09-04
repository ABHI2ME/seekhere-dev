import multer from 'multer' ;
import path from 'path' ;
import fs from 'fs' ;
import { fileURLToPath } from 'url';
import AppError from '../utils/appError.js';

const __filename = fileURLToPath(import.meta.url) ;
const __dirname = path.dirname(__filename) ;

const ensureUploadPath  = (folder) => {
    const uploadPath = path.join(__dirname , folder) ;

    if (!fs.existsSync(uploadPath)) {                //this is done as git doesn't upload the empty files(public is empty at this moment)
      fs.mkdirSync(uploadPath, { recursive: true }); //first time user wont be able to get the path to hold the image as there would be no folder at that time. 
    }
    return uploadPath ;
}

 const createUpload = ({
      folder = "../public/uploads/images",
      allowedTypes = ["jpeg", "jpg", "png"],
      MIMETypes = ["image/jpeg", "image/png","image/webp"],
      maxSize = 2 * 1024 * 1024, // default 2MB
}) => {
    const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, ensureUploadPath(folder));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
     
    const fileFilter = (req, file, cb) => {

    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    const mimetype = file.mimetype;

    if (allowedTypes.includes(ext) && MIMETypes.includes(mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Only ${allowedTypes.join(", ")} files are allowed!` , 501 , "invalid file type"));
    }
  };

  const limits = {fileSize:maxSize } ;

  return multer({
      storage,
      fileFilter,
      limits
  });
};

export default createUpload ;



