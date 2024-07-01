# Authentication, Authorization and Security

#### MODELLING USERS

```js
import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide a valid email.'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email.'],
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Please provide passwords.'],
      minlength: 8,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your passwords.'],
      minlength: 8,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
```

#### CREATING NEW USERS

```js
import express from 'express';

import { signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);

export default router;
```

```js
import { User } from '../model/user.model.js';
import { catchAsync } from '../utils/catchAsync.js';

const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({ status: 'success', data: { user: newUser } });
});

export { signup };
```

```js
// post  http://localhost:8000/api/v1/users/signup

// {
//     "name": "jonas",
//     "email": "hello@jonas.io",
//     "password": "123456789",
//     "passwordConfirm": "123456789"
// }

// {
//     "status": "success",
//     "data": {
//         "user": {
//             "name": "jonas",
//             "email": "hello@jonas.io",
//             "password": "123456789",
//             "passwordConfirm": "123456789",
//             "_id": "662fe6f042f3271bd41e0551",
//             "createdAt": "2024-04-29T18:29:04.493Z",
//             "updatedAt": "2024-04-29T18:29:04.493Z",
//             "__v": 0
//         }
//     }
// }
```

#### MANAGING PASSWORDS

```bash
npm install bcryptjs
```

```js
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide a valid email.'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email.'],
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Please provide passwords.'],
      minlength: 8,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your passwords.'],
      minlength: 8,
      validate: {
        // This only works on Create or Save!!!
        validator: function (el) {
          return el === this.password;
        },
        message: `Passwords are not the same!`,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  // only run this function if Password was actually modified or changed
  if (!this.isModified('password')) {
    return next();
  }

  // hash the password with coast of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm fields
  this.passwordConfirm = undefined;

  next();
});

export const User = mongoose.model('User', userSchema);
```

```js
// post http://localhost:8000/api/v1/users/signup

// {
//     "name": "jonas",
//     "email": "hello@jonas.io",
//     "password": "123456789",
//     "passwordConfirm": "123456789"
// }

// {
//     "status": "success",
//     "data": {
//         "user": {
//             "name": "jonas",
//             "email": "hello@jonas.io",
//             "password": "$2a$12$G5SvDqvaCa34hei8MMgGr.VReewIT7S6p8DqZtkiYuhL8/NhuWUnG",
//             "_id": "662fec7980fcb7c222859008",
//             "createdAt": "2024-04-29T18:52:41.393Z",
//             "updatedAt": "2024-04-29T18:52:41.393Z",
//             "__v": 0
//         }
//     }
// }
```

#### HOW AUTHENTICATION WITH JWT WORKS

![HOW AUTHENTICATION WITH JWT WORKS](images/8/8_intro_1.png)
![HOW AUTHENTICATION WITH JWT WORKS 2](images/8/8_intro_2.png)
![HOW AUTHENTICATION WITH JWT WORKS 2](images/8/8_intro_3.png)

#### SIGNING UP USERS

```bash
 npm i jsonwebtoken
```

```js
// .env
// JWT_SECRET=my-secret-token-secret-token-secret-token
// JWT_EXPIRES_IN=90d

// auth.controller.js
import { User } from '../model/user.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';

const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({ name, email, password, passwordConfirm });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({ status: 'success', data: { user: newUser }, token });
});

export { signup };
```

```js
// post http://localhost:8000/api/v1/users/signup

// {
//     "name": "jonas",
//     "email": "hello@jonas.io",
//     "password": "123456789",
//     "passwordConfirm": "123456789"
// }

// {
//     "status": "success",
//     "data": {
//         "user": {
//             "name": "jonas",
//             "email": "hello@jonas.io",
//             "password": "$2a$12$CluZIT1/IkiAuLBQLJmPseIB9KdQJoXF0ZR51x1Rv7WP5yvfhJvAa",
//             "_id": "662ff53c4ce78742a1c4158f",
//             "createdAt": "2024-04-29T19:30:04.895Z",
//             "updatedAt": "2024-04-29T19:30:04.895Z",
//             "__v": 0
//         }
//     },
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MmZmNTNjNGNlNzg3NDJhMWM0MTU4ZiIsImlhdCI6MTcxNDQxOTAwNSwiZXhwIjoxNzIyMTk1MDA1fQ.TRKGjTuCWgCZ8LDD5Ikn58486cvo-ET7kjiWVMTG-k0"
// }
```

#### LOGGING IN USERS

```js
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide a valid email.'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email.'],
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Please provide passwords.'],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your passwords.'],
      minlength: 8,
      validate: {
        // This only works on Create or Save!!!
        validator: function (el) {
          return el === this.password;
        },
        message: `Passwords are not the same!`,
      },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  // only run this function if Password was actually modified or changed
  if (!this.isModified('password')) {
    return next();
  }

  // hash the password with coast of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm fields
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

export const User = mongoose.model('User', userSchema);
```

```js
import { User } from '../model/user.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({ name, email, password, passwordConfirm });

  // const token = jwt.sign(
  //   { id: newUser._id },
  //   process.env.JWT_SECRET,
  //   { expiresIn: process.env.JWT_EXPIRES_IN }
  // )

  const token = signToken(newUser._id);

  res.status(201).json({ status: 'success', data: { user: newUser }, token });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(`Please provide email or password`, 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Incorrect provide email or password`, 401));
  }

  const token = signToken(user._id);

  res.status(201).json({ status: 'success', data: { user }, token });
});

export { signup, login };
```

#### TOUR ROUTES - PART I

```js
router.route('/').get(protectMiddleware, getALLTours).post(createTour);
```

```js
import { User } from '../model/user.model.js';
import { AppError } from '../utils/appError.js';
import { catchAsync } from '../utils/catchAsync.js';
import jwt from 'jsonwebtoken';

import { promisify } from 'util';

const protectMiddleware = catchAsync(async (req, res, next) => {
  let token;

  // 1) Getting the token and checking of it's exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // console.log(token);

  if (!token) {
    return next(
      new AppError(`You are not logged in ! Please log in to get access`, 401)
    );
  }

  // 2) Verification of the token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(`The User belonging to this token does no longer exist`, 401)
    );
  }

  // 4) Check if user changed password after the token has issued

  // if (currentUser.changePasswordAfter(decoded.iat)) {
  //   return next(
  //     new AppError(`User recently changed password! Please log in again`, 401)
  //   );
  // }

  // Grant access to the Protected route
  req.user = currentUser;

  next();
});

export { protectMiddleware };
```

```js
//  console.log(decoded);
// {
//    id: '662ffc4d63af4fe41d631b42',
//  iat: 1714421642,
//  exp: 1722197642
//  }
```

```js
userSchema.methods.changePasswordAfter = async function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // console.log(this.passwordChangedAt, JWTTimestamp); // 2024-04-30T00:00:00.000Z 1714644635
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // console.log(changedTimestamp, JWTTimestamp); // 2024-04-30T00:00:00.000Z 1714644635

    return JWTTimestamp < changedTimestamp;
    //  Return true if password changed after token issuance : true -> 100 < 200 ,false -> 300 < 200
  }

  return false; // Password not changed
};
```

```js
const handleJWTError = () => {
  return new AppError(`Invalid token. Please log in again`, 401);
};

const handleJWTExpiredError = () => {
  return new AppError(`Your token has expired! Please log in again`, 401);
};

export const errorHandler = (err, req, res, next) => {
  // console.log(err.stack);

  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDEV(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(err, res);
  }
};
```

#### ADVANCED POSTMAN SETUP

```js
//test for save token in environment variable
pm.environment.set('jwt', pm.response.json().token);
```

![ ADVANCED POSTMAN SETUP](images/8/8_intro_4.png)

#### AUTHORIZATION : USER ROLES AND PERMISSIONS

```js
router
  .route('/:id')
  .delete(
    protectMiddleware,
    restrictToMiddleware('admin', 'lead-guide'),
    deleteTour
  );

const protectMiddleware = catchAsync(async (req, res, next) => {
  let token;

  // 1) Getting the token and checking of it's exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // console.log(token);

  if (!token) {
    return next(
      new AppError(`You are not logged in ! Please log in to get access`, 401)
    );
  }

  // 2) Verification of the token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log(decoded);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(`The User belonging to this token does no longer exist`, 401)
    );
  }

  // 4) Check if user changed password after the token has issued

  // if (currentUser.changePasswordAfter(decoded.iat)) {
  //   return next(new AppError(`User recently changed password! Please log in again`, 401));
  // }

  // Grant access to the Protected route
  req.user = currentUser;

  next();
});

const restrictToMiddleware = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide'] , roles = 'user'

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`You do not have permission to preform this action`, 403)
      );
    }

    next();
  };
};

export { restrictToMiddleware };
```

#### PASSWORDS RESET FUNCTIONALITY: RESET TOKEN

```js
import {
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';

router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);

export default router;
```

```js
// user.model.js

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log(
    { resetToken },
    this.passwordResetToken,
    this.passwordResetExpires
  );
  // { resetToken: '0b095a40a87aa595506c9ef517987a956c6cc399209ac7a030a570fed328e2fb'}
  // {passwordResetToken : 1731a92c6d062bfc208eb775c023f0a35fd6e0be4ad307e3a94036425811aee6}
  // {passwordResetExpires: 2024-05-02T11: 47: 34.411Z }

  return resetToken;
};
```

```js
const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get User based on Posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError(`There is no user with email address`, 404));
  }

  // 2) generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email address
});

const resetPassword = catchAsync(async (req, res, next) => {});

export { forgotPassword, resetPassword };
```

#### SENDING EMAILS WITH NODEMAILER

```bash
npm i nodemailer

```

```js
EMAIL_USER=
EMAIL_PASSWORD=
MAILTRAP_HOST=
MAILTRAP_PORT=
```

```js
import {
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';

router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);

export default router;
```

```js
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  console.log(
    { resetToken },
    this.passwordResetToken,
    this.passwordResetExpires
  );
  // { resetToken: '0b095a40a87aa595506c9ef517987a956c6cc399209ac7a030a570fed328e2fb'}
  // {passwordResetToken : 1731a92c6d062bfc208eb775c023f0a35fd6e0be4ad307e3a94036425811aee6}
  // {passwordResetExpires: 2024-05-02T11: 47: 34.411Z }

  return resetToken;
};
```

```js
import { sendEmail, generateResetPasswordEmail } from '../utils/nodeEmail.js';

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get User based on Posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError(`There is no user with email address`, 404));
  }

  // 2) generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email address
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;
  const message = generateResetPasswordEmail(resetURL);

  // const message = `Forgot your password? Submit a Patch request with your new password and passwordConfirm
  // to : ${resetURL}.\n if you did'nt forget your password, please ignore this email!!! `;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your password reset token (valid for 2min)`,
      message: message,
    });

    return res
      .status(200)
      .json({ status: 'success', message: `Token sent to email` });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        `There was an error sending the email. try again later! `,
        500
      )
    );
  }
});

export { forgotPassword };
```

```js
// utils/nodemailer.js

import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1) Create a transporter

  const transporter = nodemailer.createTransport({
    // service: "Gmail",
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in Gmail "less secure app" option
  });

  // 2) Define the email options

  const mailOptions = {
    from: 'ABC <hello.jonas.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.message,
  };

  // 3) Actually send the email
  const emails = await transporter.sendMail(mailOptions);
  // console.log(emails);
};

const generateResetPasswordEmail = (resetURL) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password</title>
    </head>
    <body style="font-family: Arial, sans-serif;">
      <div style="background-color: #f2f2f2; padding: 20px;">
        <h2 style="color: #333;">Forgot your password?</h2>
        <p style="color: #666;">If you've forgotten your password, please submit a Patch request with your new password and password confirmation by clicking the button below:</p>
        <a href="${resetURL}" style="background-color: blue; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px; margin-top: 15px;">Reset Password</a>
        <p style="color: #666; margin-top: 20px;">If you didn't forget your password, please ignore this email.</p>
      </div>
    </body>
    </html>`;
};

export { sendEmail, generateResetPasswordEmail };

//{
//   accepted: [ 'hello@jonass.io' ],
//   rejected: [],
//   ehlo: [
//     'SIZE 5242880',
//     'PIPELINING',
//     'ENHANCEDSTATUSCODES',
//     '8BITMIME',
//     'DSN',
//     'AUTH PLAIN LOGIN CRAM-MD5'
//   ],
//   envelopeTime: 720,
//   messageTime: 519,
//   messageSize: 602,
//   response: '250 2.0.0 Ok: queued',
//   envelope: { from: 'hello.jonas.io', to: [ 'hello@jonass.io' ] },
//   messageId: '<5712fc87-b1c5-6fc8-3c61-7a8c0d48cb9a@hello.jonas.io>'
// }
```

#### RESET FUNCTIONALITY: SETTING NEW PASSWORD

```js
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) if the token has not expired ,and there is user , set the new password

  if (!user) {
    return next(new AppError(`Token is invalid or has expired`, 400));
  }

  // 3) Update changePasswordAt property for the user
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 4) Log the user in ,send JWT token

  const token = signToken(user._id);

  res.status(201).json({ status: 'success', token });
});
```

#### UPDATING THE CURRENT USER: PASSWORD

```js
router.patch('/updateMyPassword/:token', protectMiddleware, updatePassword);

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({ status: 'success', data: { user }, token });
};

const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection

  const user = await User.findById(req.user.id).select('+password');

  // 2) check if user posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) if so update password

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // User.findByIdAndUpdate() will not work as intended!
  await user.save();

  // 4) log user in,send JWT token

  // const token = signToken(newUser._id)

  // res
  //   .status(201)
  //   .json({ status: 'success', data: { user: newUser }, token })

  createSendToken(user, 200, res);
});
```

#### UPDATING THE CURRENT USER: DATA

```js
router.patch('/updateMe', protectMiddleware, updateMe);

const updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user posts password data

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        `This route id not for password updates. Please use /updateMyPassword`,
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});
```

#### DELETING THE CURRENT USER

```js
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    active: { type: Boolean, default: true, select: false },
  },
  { timestamps: true }
);

userSchema.pre(/^find/, async function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });

  next();
});

export const User = mongoose.model('User', userSchema);
```

```js
router.delete('/deleteMe', protectMiddleware, deleteMe);

const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});
```

#### SECURITY BEST PRACTICES

![SECURITY BEST PRACTICES](images/8/8_intro_5.png)

#### SENDING JWT VIA COOKIE

```js
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // important provide and avoid cross site scripting
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  // Remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({ status: 'success', data: { user }, token });
};
```

#### IMPLEMENTING RATE LIMITING

```bash
npm i express-rate-limit
```

```js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  max: 1,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests for this IP, Please try again in an hour.',
});

app.use('/api', limiter);
```

```js
// GET {{NATOURS_URL}}/api/v1/tours Auth
// Type Bearer Token

// headers -> X-RateLimit-Limit and X-RateLimit-Remaining
```

#### SETTING SECURITY HTTP HEADERS

```bash
 npm i helmet
```

```js
import express from 'express';
import morgan from 'morgan';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { AppError } from './utils/appError.js';
import { errorHandler } from './utils/errorHandler.js';

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 1) Global MIDDLEWARES

// Set Security HTTP headers
app.use(helmet());

// Body parser ,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Development logging
if (process.env.NODE_ENV !== 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 1,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests for this IP, Please try again in an hour.',
});

// Limiter
app.use('/api', limiter);

// Serving  static files
app.use(express.static(`${__dirname}/../public/`));

import tourRouter from './routes/tours.routes.js';
import usersRouter from './routes/users.routes.js';

export { app };

//  after adding
```

#### DATA SANITIZATION

```js
// 1) Data Sanitization against NoSQL query injection

// POST http://localhost:8000/api/v1/users/login

// {
//   "email":{ "$gt": "" },
//   "password": "123456789"
// }

// {
//     "status": "success",
//     "data": {
//         "user": {
//             "_id": "663372b668f92af5f7db3177",
//             "name": "admin-jonass",
//             "email": "admin-hello@jonass.io",
//             "role": "admin",
//             "createdAt": "2024-05-02T11:02:14.888Z",
//             "updatedAt": "2024-05-02T11:02:14.888Z",
//             "__v": 0
//         }
//     },
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MzM3MmI2NjhmOTJhZjVmN2RiMzE3NyIsImlhdCI6MTcxNDc0OTcxOCwiZXhwIjoxNzIyNTI1NzE4fQ.nbz53Ee5BXqvj052fFa2Ir-0cF-f06MoXknxQjtxGoU"
// }
```

```bash
npm i express-mongo-sanitize
npm i xss-clean
```

```js
// POST http://localhost:8000/api/v1/users/signup
// {
//   "name": "testjonass",
//   "email": "testhello@jonass.io",
//   "password": "123456789",
//   "passwordConfirm": "123456789",
//   "role": "<div id='bad' > Name </div> "
// }

// {
//     "status": "error",
//     "message": "User validation failed: role: `<div id='bad' > Name </div> ` is not a valid enum value for path `role`.",
//     "stack": "ValidationError: User validation failed: role: `<div id='bad' > Name </div> ` is not a valid enum value for path `role`.\n    at Document.invalidate (C:\\Users\\abc\\OneDrive\\Desktop\\backend_node_express_mongodb\\node_modules\\mongoose\\lib\\document.js:3289:32)\n    at C:\\Users\\abc\\OneDrive\\Desktop\\backend_node_express_mongodb\\node_modules\\mongoose\\lib\\document.js:3050:17\n    at C:\\Users\\abc\\OneDrive\\Desktop\\backend_node_express_mongodb\\node_modules\\mongoose\\lib\\schemaType.js:1388:9\n    at process.processTicksAndRejections (node:internal/process/task_queues:77:11)",
//     "error": {
//         "errors": {
//             "role": {
//                 "name": "ValidatorError",
//                 "message": "`<div id='bad' > Name </div> ` is not a valid enum value for path `role`.",
//                 "properties": {
//                     "message": "`<div id='bad' > Name </div> ` is not a valid enum value for path `role`.",
//                     "type": "enum",
//                     "enumValues": [
//                         "admin",
//                         "user",
//                         "guide",
//                         "lead-guide"
//                     ],
//                     "path": "role",
//                     "value": "<div id='bad' > Name </div> "
//                 },
//                 "kind": "enum",
//                 "path": "role",
//                 "value": "<div id='bad' > Name </div> "
//             }
//         },
//         "_message": "User validation failed",
//         "status": "error",
//         "statusCode": 500,
//         "name": "ValidationError",
//         "message": "User validation failed: role: `<div id='bad' > Name </div> ` is not a valid enum value for path `role`."
//     }
// }
```

```js
import express from 'express';
import morgan from 'morgan';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { AppError } from './utils/appError.js';
import { errorHandler } from './utils/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 1) Global MIDDLEWARES

// Set Security HTTP headers
app.use(helmet());

// Body parser ,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS (cross-site scripting) with html code
app.use(xss());

// Development logging
if (process.env.NODE_ENV !== 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests for this IP, Please try again in an hour.',
});

app.use('/api', limiter);

// Serving  static files
app.use(express.static(`${__dirname}/../public/`));

import tourRouter from './routes/tours.routes.js';
import usersRouter from './routes/users.routes.js';

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', usersRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

export { app };
```

#### PREVENTING PARAMETER POLLUTION

```bash
npm i hpp
```

```js
import express from 'express';
import morgan from 'morgan';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { AppError } from './utils/appError.js';
import { errorHandler } from './utils/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 1) Global MIDDLEWARES

// Set Security HTTP headers
app.use(helmet());

// Body parser ,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS (cross-site scripting) with html code
app.use(xss());

// Prevent parameter pollution (whitelist with example)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Development logging
if (process.env.NODE_ENV !== 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests for this IP, Please try again in an hour.',
});

app.use('/api', limiter);

// Serving  static files
app.use(express.static(`${__dirname}/../public/`));

import tourRouter from './routes/tours.routes.js';
import usersRouter from './routes/users.routes.js';

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', usersRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

export { app };
```
