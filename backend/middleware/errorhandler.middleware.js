import multer from 'multer' ;


const errorHandler = (err, req, res, next) => {
  console.error("Error:", err); // for debugging

  // Multer-specific errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      errorType: "MULTER_ERROR",
      message: err.message,
      field: err.field || null,
    });
  }

  console.error("Error caught in middleware:", {
    message: err.message,
    statusCode: err.statusCode,
    errorType: err.errorType,
    stack: err.stack,
  });

  // Custom AppError (from utils/AppError)
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      errorType: err.errorType || "APP_ERROR",
      message: err.message,
    });
  }

  // Fallback for unhandled errors
  return res.status(500).json({
    success: false,
    errorType: "SERVER_ERROR",
    message: "Something went wrong, please try again later.",
  });
};

export default  errorHandler ;
