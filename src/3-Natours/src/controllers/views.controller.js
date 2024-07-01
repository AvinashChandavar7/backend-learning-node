import { Tour } from "../model/tour.model.js";
import { User } from "../model/user.model.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";


const getOverview = catchAsync(async (req, res, next) => {

  // 1) Get the Tours Data from Collection
  const tours = await Tour.find();
  // 2) Build template

  // 3) Render the template using tour data from 1)
  res.status(200).render('overview', { title: "All Tours", tours });
})

const getTour = catchAsync(async (req, res, next) => {
  // 1) Get the Tour Data for the Requested tour details (Including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug })
    .populate({ path: 'reviews', fields: 'reviews rating user' });

  if (!tour) {
    return next(new AppError('There is no tour without name', 400))
  }

  // 2) Build template



  // 3) Render the template using tour data from 1)
  res.status(200).render('tour', { title: `${tour.name} tour`, tour });
})


const getLoginForm = catchAsync(async (req, res, next) => {
  // 1) Render the template using tour data from 1)
  res.status(200).render('login', { title: `Log into your account` });
})

const getSignUpForm = catchAsync(async (req, res, next) => {
  // 1) Render the template using tour data from 1)
  res.status(200).render('signup', { title: `sign up into your account` });
})

const getAccount = catchAsync(async (req, res, next) => {
  // 1) Render the template using tour data from 1)
  res.status(200).render('account', { title: `Your account` });
})

const updateUserData = catchAsync(async (req, res, next) => {
  console.log('Updating user data', req.body);

  const updateUser = await User.findByIdAndUpdate(
    req.user.id,
    { name: req.body.name, email: req.body.email },
    { new: true, runValidators: true }
  );

  res.status(200).render('account', { title: `Your account`, user: updateUser });

})

export {
  getOverview,
  getTour,
  getLoginForm,
  getSignUpForm,
  getAccount,

  updateUserData
}