
const { handleForm } = require('./handlers/formHandler');
function uploader(validationRules, uploadOptions) {
  // Return a middleware function to handle file uploads
  
  return (req, res, next) => {
    // Call the handleForm function with the provided parameters
    handleForm(req, res, next, validationRules, uploadOptions);
  };
}

module.exports = uploader;
