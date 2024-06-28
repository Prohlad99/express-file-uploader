function sendErrorResponse(res, errors, statusCode = 400, responseSent) {
  // Check if a response has already been sent
    if (!responseSent) {
      // Send the error response with the specified status code and error messages
      res.status(statusCode).json({ errors });
    }
  }
  
  module.exports = { sendErrorResponse };
  