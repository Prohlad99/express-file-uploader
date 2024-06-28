const { validationResult } = require('express-validator');

function validateFiles(req, fileErrors) {
  // Get validation errors from the request
  const formErrors = validationResult(req);

  // Combine form validation errors and file validation errors
  const errors = [...formErrors.array(), ...fileErrors];
  return errors;
}

module.exports = { validateFiles };
