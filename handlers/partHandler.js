const fs = require('fs');
const path = require('path');
const { sendErrorResponse } = require('../utils/sendErrorResponse');
const { saveFile } = require('../utils/saveFile');

function handlePart(part, options, fileCounts, fileErrors, files, fields, responseSent) {
  if (responseSent) {
    part.resume();
    return;
  }

  if (part.filename) {
    const option = options[part.name];
    if (!option) {
      part.resume();
      return;
    }

    // Initialize file count for this field
    if (!fileCounts[part.name]) {
      fileCounts[part.name] = 0;
    }

    // Check for multiple file upload restriction
    if (!option.multiple && fileCounts[part.name] > 0) {
      const errorMessage = option.errorMessage?.maxFiles || `Multiple files not allowed for ${part.name}`;
      fileErrors.push({
        msg: errorMessage,
        type: 'file',
        path: part.name,
        location: 'files',
        value: part.filename
      });
      part.resume();
      return;
    }

    // Check if maxFiles limit is exceeded
    if (option.maxFiles && fileCounts[part.name] >= option.maxFiles) {
      const errorMessage = option.errorMessage?.maxFiles || `Maximum number of files exceeded for ${part.name}. Allowed: ${option.maxFiles}`;
      fileErrors.push({
        msg: errorMessage,
        type: 'file',
        path: part.name,
        location: 'files',
        value: part.filename
      });
      part.resume();
      return;
    }

    // Increment file count here
    fileCounts[part.name] += 1;

    // Get file extension and check if it's allowed
    const fileExtension = path.extname(part.filename).toLowerCase();
    const allowedTypes = option.allowedTypes.map(type => type.split('/')[1].toLowerCase());
    const fileType = fileExtension.substring(1);

    if (!allowedTypes.includes(fileType)) {
      const errorMessage = option.errorMessage?.invalidType || `Invalid file type for ${part.name}. Allowed types: ${option.allowedTypes.join(', ')}`;
      fileErrors.push({
        msg: errorMessage,
        type: 'file',
        path: part.name,
        location: 'files',
        value: part.filename
      });
      part.resume();
      return;
    }

    let fileSize = 0;
    const fileBuffer = [];
    let sizeErrorAdded = false; // Flag to check if size error is already added

    // Collect file data in chunks and check for size limit
    part.on('data', chunk => {
      if (responseSent) {
        return;
      }
      fileSize += chunk.length;
      fileBuffer.push(chunk);
      if (fileSize > option.maxSize && !sizeErrorAdded) {
        const errorMessage = option.errorMessage?.sizeExceeded || `File size exceeds the limit for ${part.name}. Max size: ${option.maxSize / (1024 * 1024)} MB`;
        fileErrors.push({
          msg: errorMessage,
          type: 'file',
          path: part.name,
          location: 'files',
          value: part.filename
        });
        sizeErrorAdded = true; // Set the flag to true after adding the error
        part.resume();
        return;
      }
    });

    // End of file upload handling
    part.on('end', () => {
      if (!fields[part.name]) {
        fields[part.name] = [];
      }
      if (!sizeErrorAdded) { // Only add file if there was no size error
        files.push({ name: part.name, buffer: Buffer.concat(fileBuffer), filename: part.filename, option });
        fields[part.name].push(part.filename);
      }
    });
  } else {
    part.resume();
  }
}

module.exports = { handlePart };
