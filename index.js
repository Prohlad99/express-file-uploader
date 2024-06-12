const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');

function uploader(validationRules, uploadOptions) {
  return (req, res, next) => {
    const form = new multiparty.Form();
    let responseSent = false;
    let fileErrors = [];
    let files = [];
    let fields = {};

    const sendErrorResponse = (errors, statusCode = 400) => {
      if (!responseSent) {
        responseSent = true;
        res.status(statusCode).json({ errors });
      }
    };

    form.on('error', (err) => {
      console.error('Error parsing form:', err);
      sendErrorResponse([{ msg: err.message, type: 'form', path: '', location: 'form' }], 500);
      return next(err);
    });

    form.on('field', (name, value) => {
      if (uploadOptions[name] && uploadOptions[name].multiple) {
        if (!fields[name]) {
          fields[name] = [];
        }
        fields[name].push(value);
      } else {
        fields[name] = value;
      }
    });

    form.on('part', (part) => {
      if (responseSent) {
        part.resume();
        return;
      }

      if (part.filename) {
        const option = uploadOptions[part.name];
        if (!option) {
          part.resume();
          return;
        }

        const fileExtension = path.extname(part.filename).toLowerCase();
        const allowedTypes = option.allowedTypes.map(type => type.split('/')[1].toLowerCase());
        const fileType = fileExtension.substring(1);

        if (!allowedTypes.includes(fileType)) {
          fileErrors.push({
            msg: `Invalid file type for ${part.name}. Allowed types: ${option.allowedTypes.join(', ')}`,
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

        part.on('data', chunk => {
          if (responseSent) {
            return;
          }
          fileSize += chunk.length;
          fileBuffer.push(chunk);
          if (fileSize > option.maxSize) {
            fileErrors.push({
              msg: `File size exceeds the limit for ${part.name}. Max size: ${option.maxSize / (1024 * 1024)} MB`,
              type: 'file',
              path: part.name,
              location: 'files',
              value: part.filename
            });
            part.resume();
            return;
          }
        });

        part.on('end', () => {
          if (!fields[part.name]) {
            fields[part.name] = [];
          }
          files.push({ name: part.name, buffer: Buffer.concat(fileBuffer), filename: part.filename, option });
          fields[part.name].push(part.filename);
        });
      } else {
        part.resume();
      }
    });

    form.on('close', () => {
      if (responseSent) {
        return;
      }

      req.body = fields;

      // Run form validation
      Promise.all(validationRules.map(validation => validation.run(req)))
        .then(() => {
          const formErrors = validationResult(req);
          if (!formErrors.isEmpty() || fileErrors.length > 0) {
            const errors = [...formErrors.array(), ...fileErrors];
            return sendErrorResponse(errors, 400);
          }

          // No validation errors, proceed to save files
          files.forEach(file => {
            const newFileName = `${Date.now()}_${file.filename}`;
            const newFilePath = path.join(file.option.uploadDir, newFileName);

            if (!fs.existsSync(file.option.uploadDir)) {
              fs.mkdirSync(file.option.uploadDir, { recursive: true });
            }

            fs.writeFileSync(newFilePath, file.buffer);

            if (!req.body[file.name]) {
              req.body[file.name] = [];
            }
            req.body[file.name].push(newFileName);
          });

          if (!responseSent) {
            responseSent = true;
            next();
          }
        })
        .catch(err => {
          sendErrorResponse([{ msg: err.message, type: 'form', path: '', location: 'form' }], 500);
          next(err);
        });
    });

    form.parse(req);
  };
}

module.exports = uploader;
