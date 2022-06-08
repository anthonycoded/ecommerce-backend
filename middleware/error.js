const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  console.log(err);

  //mongodb errors
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "validationError") {
    const messagee = Object.values(err.erros).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    sucess: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
