import sharp from "sharp";

import { User } from "../model/user.model.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

import handleFactory from './handleFactory.js'

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  })
  return newObj;
}

const createUser = catchAsync(async (req, res, next) => {
  res.status(500)
    .json({ status: "error", message: "This routes is not yet defined! Please use /signup instead instead." })
});

const getAllUsers = handleFactory.getAll(User, "user");
const getUserById = handleFactory.getOne(User, "user");

// Do NOT update passwords with this api
const updateUser = handleFactory.updateOne(User, "user");
const deleteUser = handleFactory.deleteOne(User)


// ! ME Api
const getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();


  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/3-Natours/public/img/users/${req.file.filename}`);

  next();
});

const updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);

  // 1) Create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError(`This route id not for password updates. Please use /updateMyPassword`, 400));
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id, filteredBody, { new: true, runValidators: true }
  );

  res.status(200).json({ status: 'success', data: { user: updatedUser } })
})

const deleteMe = catchAsync(async (req, res, next) => {

  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({ status: 'success', data: null })
})



export {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,

  getMe,

  resizeUserPhoto,
  updateMe,

  deleteMe,
}


// const getAllUsers = catchAsync(async (req, res, next) => {

//   const users = await User.find({});

//   res.status(200)
//     .json({
//       status: 'success', results: users.length, data: { users },
//     });
// })

// const updateUser = catchAsync(async (req, res, next) => {
//   res.status(500).json({
//     status: "error",
//     message: "This routes is nto yet defined"
//   })
// });

// const deleteUser = catchAsync(async (req, res, next) => {
//   res.status(500).json({
//     status: "error",
//     message: "This routes is nto yet defined"
//   })
// });