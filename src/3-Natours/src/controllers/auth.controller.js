import { User } from "../model/user.model.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";

import crypto from "crypto";

import { promisify } from "util"
import { Email } from "../utils/nodeEmail.js";
// import { sendEmail, generateResetPasswordEmail } from "../utils/nodeEmail.js";


const signToken = id => {
  const token = jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

  return token;
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true, // important provide and avoid cross site scripting
  }

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie("jwt", token, cookieOptions)

  // Remove the password from the output
  user.password = undefined;

  res.status(statusCode)
    .json({ status: 'success', data: { user }, token })
}

const signup = catchAsync(async (req, res, next) => {
  // const { name, email, password, passwordConfirm, passwordChangedAt, role } = req.body;
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);

  // const token = jwt.sign(
  //   { id: newUser._id },
  //   process.env.JWT_SECRET,
  //   { expiresIn: process.env.JWT_EXPIRES_IN }
  // )
  // const token = signToken(newUser._id)

  // res.status(201).json({ status: 'success', data: { user: newUser }, token })
})

const login = catchAsync(async (req, res, next) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(`Please provide email or password`, 400))
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Incorrect provide email or password`, 401))
  }

  createSendToken(user, 200, res);
  // const token = signToken(user._id)

  // res
  //   .status(201)
  //   .json({ status: 'success', data: { user }, token })
})

const logout = catchAsync(async (req, res, next) => {

  res.cookie(
    "jwt",
    "loggedOut",
    { expires: new Date(Date.now() + 10 * 1000), httpOnly: true }
  )

  res.status(201)
    .json({ status: 'success' })
});

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get User based on Posted email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError(`There is no user with email address`, 404))
  }

  // 2) generate the random reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email address
  // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;
  // const message = generateResetPasswordEmail(resetURL);

  // const message = `Forgot your password? Submit a Patch request with your new password and passwordConfirm
  // to : ${resetURL}.\n if you did'nt forget your password, please ignore this email!!! `

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: `Your password reset token (valid for 2min)`,
    //   message: message,
    // })

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();


    return res.status(200).json(
      { status: 'success', message: `Token sent to email` }
    );

  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError(`There was an error sending the email. try again later! `, 500))

  }


})

const resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token 
  const hashedToken
    = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  })

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

  createSendToken(user, 201, res);
  // const token = signToken(user._id)

  // res
  //   .status(201)
  //   .json({ status: 'success', token })
})

const updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection

  const user = await User.findById(req.user.id).select("+password")

  // 2) check if user posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401))
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
})




// middleware
const protectMiddleware = catchAsync(async (req, res, next) => {

  let token;

  // 1) Getting the token and checking of it's exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(" ")[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // console.log(token);

  if (!token) {
    return next(new AppError(`You are not logged in ! Please log in to get access`, 401))
  }

  // 2) Verification of the token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  // console.log(decoded);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError(
      `The User belonging to this token does no longer exist`,
      401
    ));
  }

  // 4) Check if user changed password after the token has issued

  // if (currentUser.changePasswordAfter(decoded.iat)) {
  //   return next(new AppError(`User recently changed password! Please log in again`, 401));
  // }


  // Grant access to the Protected route
  req.user = currentUser;
  res.locals.user = currentUser
  next();
})

// middleware for only rendered pages , no errors
// const isLoggedInMiddleware = catchAsync(async (req, res, next) => {
//   if (req.cookies.jwt) {
//     // 1) Verification of the token
//     const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
//     // console.log(decoded);

//     // 2) Check if user still exists
//     const currentUser = await User.findById(decoded.id);

//     if (!currentUser) {
//       return next()
//     }

//     // There is a logged in user
//     res.locals.user = currentUser
//     return next();
//   }
//   next();
// })

const isLoggedInMiddleware = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verification of the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
      // console.log(decoded);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next()
      }

      // There is a logged in user
      res.locals.user = currentUser
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
}


const restrictToMiddleware = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide'] , roles = 'user'

    if (!roles.includes(req.user.role)) {
      return next(new AppError(`You do not have permission to preform this action`, 403));
    }

    next();
  }
}





export {
  signup,
  login,
  logout,

  forgotPassword,
  resetPassword,

  updatePassword,

  protectMiddleware,
  isLoggedInMiddleware,
  restrictToMiddleware
}