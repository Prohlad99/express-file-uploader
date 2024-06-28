const fs = require('fs');

function createDirectory(dirPath, fieldName, res, responseSent, next) {

  // Check if the directory already exists
  if (!fs.existsSync(dirPath)) {

    try {
      // Create the directory recursively
      fs.mkdirSync(dirPath, { recursive: true });

    } catch (err) {

      // Handle any errors during directory creation
      const errorMessage = `Failed to create upload directory for ${fieldName}: ${err.message}`;
      sendErrorResponse(res, [{ msg: errorMessage, type: 'file', path: fieldName, location: 'files' }], 500, responseSent);
      responseSent = true;
      next(err);
      
    }
  }
}

module.exports = { createDirectory };
