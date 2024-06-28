const { validationResult } = require('express-validator');

async function validateForm(req, validationRules) {
  // Run all validation rules asynchronously
  await Promise.all(validationRules.map(validation => validation.run(req)));

  // Collect validation errors from the request
  const formErrors = validationResult(req);
  
  return formErrors;
}

module.exports = { validateForm };
