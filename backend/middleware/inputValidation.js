import {body, validationResult} from 'express-validator' ;
import sanitizeHtml from 'sanitize-html' ;
import AppError from '../utils/appError.js';



const inputValidation = (maxLength) => [
     body("text")
    .trim()
    .notEmpty().withMessage("Comment text can't be empty")
    .customSanitizer((value) =>
      sanitizeHtml(value, {
        allowedTags: [], // remove all tags
        allowedAttributes: {},
      }))
    .isLength({ min: 1, max: maxLength }).withMessage("Text must be between 1 and 500 characters")  ,

    (req , res , next) => {
        const errors = validationResult(req) ;
        if(!errors.isEmpty()){
             const firstError = errors.array()[0].msg; 
             return next(new AppError(firstError, 400, "ValidationError"));
        } 
        next() ;
    } 

] ;

export default inputValidation ;