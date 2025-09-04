class AppError extends Error {

// my exmaple error  "return next(new AppError("Invalid credentials", 401, "AUTH_ERROR"));"
  
  constructor(message, statusCode, errorType = "GENERAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;


    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError ;
