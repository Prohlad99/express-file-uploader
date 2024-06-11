# express-file-uploader

A middleware for handling file uploads with validation in Express.js.

## Installation

To install the package, use npm or yarn:

```bash
npm install express-file-uploader
# or
yarn add express-file-uploader
```
# Usage
## _Basic Setup_
Here's how to use the `express-file-uploader` middleware in your Express application.

```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const fileUploader = require('express-file-uploader');
const User = require('./models/User'); // Assuming you have a User model

const app = express();

// Define validation rules
const validateForm = [
  body('username').notEmpty().withMessage('Name is required').isString().withMessage('Invalid value'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

// Define file upload options
const uploadOptions = {
  avatar: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    maxSize: 2 * 1024 * 1024, // 2 MB
    uploadDir: './public/uploads/avatar',
    multiple: false,
    maxFiles: 1
  }
};

// Middleware to handle form validation and file uploads
app.post('/upload', fileUploader(validateForm, uploadOptions), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let file = req.body.avatar ? req.body.avatar[1] : null;
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      avatar: file
    });

    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

# Options
## _File Upload Options_
The `uploadOptions` object allows you to specify various settings for handling file uploads. Here's a detailed description of each option:

| Option | Type |Description |
| ------ | ------ |------ |
| `allowedTypes` | Array |An array of allowed MIME types for the files. |
| `maxSize` | Number | The maximum file size allowed (in bytes). |
| `uploadDir` | String | The directory where the uploaded files will be saved.|
| `multiple` | Boolean | Whether multiple files can be uploaded for the given field.|
| `maxFiles` | Number | The maximum number of files allowed to be uploaded for the given field.|

# Example Configuration
```javascript
const uploadOptions = {
  avatar: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    maxSize: 2 * 1024 * 1024, // 2 MB
    uploadDir: './public/uploads/avatar',
    multiple: false,
    maxFiles: 1
  },
  documents: {
    allowedTypes: ['application/pdf'],
    maxSize: 5 * 1024 * 1024, // 5 MB
    uploadDir: './public/uploads/documents',
    multiple: true,
    maxFiles: 5
  }
};
```
# Form Validation
The package integrates seamlessly with `express-validator` for form validation. You define your validation rules as shown below:
```javascript
const validateForm = [
  body('username').notEmpty().withMessage('Name is required').isString().withMessage('Invalid value'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];
```
# Full Example
Here's a full example demonstrating the use of `express-file-uploader` with both file upload and form validation:
```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const fileUploader = require('express-file-uploader');
const User = require('./models/User'); // Assuming you have a User model

const app = express();

const validateForm = [
  body('username').notEmpty().withMessage('Name is required').isString().withMessage('Invalid value'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const uploadOptions = {
  avatar: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    maxSize: 2 * 1024 * 1024, // 2 MB
    uploadDir: './public/uploads/avatar',
    multiple: false,
    maxFiles: 1
  }
};

app.post('/upload', fileUploader(validateForm, uploadOptions), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    let file = req.body.avatar ? req.body.avatar[1] : null;
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      avatar: file
    });

    await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

# Contributing
If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request on [GitHub](https://github.com/Prohlad99/express-file-uploader.git).


### Explanation

- **Installation**: Instructions on how to install the package using npm or yarn.
- **Usage**: A basic example showing how to set up and use the middleware in an Express application.
- **Options**: Detailed table explaining the different options available for configuring file uploads.
- **Example Configuration**: A configuration example for multiple file fields with different settings.
- **Form Validation**: Instructions on how to validate form data using `express-validator`.
- **Full Example**: A complete example demonstrating the usage of the package with both file uploads and form validation.
- **Contributing**: Information on how to contribute to the project.
- **License**: Licensing information for the project.

By following this `README.md` file, users will have a clear understanding of how to install, configure, and use your `express-file-uploader` package.

## License

MIT

**Free Software, Hell Yeah!**

