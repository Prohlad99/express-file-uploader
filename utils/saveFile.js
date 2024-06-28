const fs = require('fs');
const { sendErrorResponse } = require('./sendErrorResponse');

function saveFile(filePath, buffer, filename, fieldName, res, responseSent, next) {

  try {

    // Write the buffer to the specified file path
    fs.writeFileSync(filePath, buffer);

  } catch (err) {

     // Handle any errors during file writing
    const errorMessage = `Failed to write file ${filename} for ${fieldName}: ${err.message}`;
    sendErrorResponse(res, [{ msg: errorMessage, type: 'file', path: fieldName, location: 'files' }], 500, responseSent);
    responseSent = true;
    next(err);
    
  }
}

module.exports = { saveFile };
