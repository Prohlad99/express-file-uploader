const multiparty = require('multiparty');
const path = require('path'); 
const { handlePart } = require('./partHandler');
const { sendErrorResponse } = require('../utils/sendErrorResponse');
const { validateForm } = require('../validators/validateForm');
const { validateFiles } = require('../validators/validateFiles');
const { createDirectory } = require('../utils/createDirectory');
const { saveFile } = require('../utils/saveFile');

function handleForm(req, res, next, validationRules, options) {
  // Create a new multiparty form instance
  const form = new multiparty.Form();
  let responseSent = false;
  let fileErrors = [];
  let files = [];
  let fields = {};
  let fileCounts = {}; 

  // Event listener for form parsing errors
  form.on('error', (err) => {
    console.error('Error parsing form:', err);
    sendErrorResponse(res, [{ msg: err.message, type: 'form', path: '', location: 'form' }], 500, responseSent);
    responseSent = true;
    return next(err);
  });

  // Event listener for fields in the form
  form.on('field', (name, value) => {
    // Handle multiple values for the same field
    if (options[name] && options[name].multiple) {
      if (!fields[name]) {
        fields[name] = [];
      }
      fields[name].push(value);
    } else {
      fields[name] = value;
    }
  });

  // Event listener for file parts in the form
  form.on('part', part => handlePart(part, options, fileCounts, fileErrors, files, fields, responseSent));

  // Event listener for form parsing completion
  form.on('close', () => {
    if (responseSent) {
      return;
    }

    req.body = fields;

    // Validate the form fields
    validateForm(req, validationRules).then(() => {
      const errors = validateFiles(req, fileErrors);
      if (errors.length > 0) {
        sendErrorResponse(res, errors, 400, responseSent);
        responseSent = true;
        return;
      }

      // No validation errors, proceed to save files
      files.forEach(file => {
        const newFileName = `${Date.now()}_${file.filename}`;
        const newFilePath = path.join(file.option.uploadDir, newFileName);

        // Ensure the upload directory exists
        createDirectory(file.option.uploadDir, file.name, res, responseSent, next);

        // Save the file to the specified path
        saveFile(newFilePath, file.buffer, file.filename, file.name, res, responseSent, next);

        // Add the saved file name to the request body
        if (!req.body[file.name]) {
          req.body[file.name] = [];
        }
        req.body[file.name].push(newFileName);
      });

      if (!responseSent) {
        responseSent = true;
        next();
      }
    }).catch(err => {
      sendErrorResponse(res, [{ msg: err.message, type: 'form', path: '', location: 'form' }], 500, responseSent);
      responseSent = true;
      next(err);
    });
  });

  // Parse the incoming request containing the form data
  form.parse(req);
}

module.exports = { handleForm };
