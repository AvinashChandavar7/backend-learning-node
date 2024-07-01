import { Review } from "../model/review.model.js";
// import { AppError } from "../utils/appError.js";
// import { catchAsync } from "../utils/catchAsync.js";

import handleFactory from './handleFactory.js'

const setTourUserIdsMiddleware = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId
  if (!req.body.user) req.body.user = req.user.id

  console.log(req.body.tour, req.body.user);
  next();
}

const getALLReviews = handleFactory.getAll(Review, "review");
const getReviewById = handleFactory.getOne(Review, "review");
const createReview = handleFactory.createOne(Review, "review")
const updateReview = handleFactory.updateOne(Review, "review")
const deleteReview = handleFactory.deleteOne(Review)



export {
  getALLReviews,
  getReviewById,

  setTourUserIdsMiddleware,
  createReview,
  updateReview,
  deleteReview,
}


//----------------------------------------------------------------

// ! getALLReviews
// const getALLReviews = catchAsync(async (req, res) => {
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId }
//   const reviews = await Review.find(filter)
//   res.status(200)
//     .json({ status: 'success', results: reviews.length, data: { reviews }, });
// })

// ! getReviewById
// const getReviewById = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id)

//   if (!review) {
//     return next(new AppError('No review found with that ID', 404))
//   }
//   // const review = await Review.findOne({ _id: id });
//   res.status(200).json({
//     status: 'success',
//     data: { review },
//   });
// })
// ! createReview
// const createReview = catchAsync(async (req, res) => {
//   // Allow nested routes
//   if (!req.body.tour) req.body.tour = req.params.tourId
//   if (!req.body.user) req.body.user = req.user.id

//   const newReview = await Review.create(req.body);

//   res.status(201)
//     .json({ status: 'success', data: { review: newReview } });
// })
