import express from 'express';

import {
  getALLTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,

  aliasTopTours,
  getTourStats,
  getMonthlyPlan,

  getToursWithin,
  getDistances,
  resizeTourImages,
} from "../controllers/tours.controller.js"

import {
  protectMiddleware,
  restrictToMiddleware,
} from '../controllers/auth.controller.js';

import reviewRouter from "../routes/reviews.routes.js"
import { upload } from '../middleware/multer.middleware.js';



const router = express.Router();


router.use("/:tourId/reviews", reviewRouter)

router
  .route("/top-5-cheap")
  .get(aliasTopTours, getALLTours)

router
  .route("/tour-stats")
  .get(getTourStats)

router
  .route("/monthly-plan/:year")
  .get(
    protectMiddleware,
    restrictToMiddleware('admin', 'lead-guide', "guide"),
    getMonthlyPlan,
  )

//  Two approaches
// /tours-within?distance=300&center=-40,45&unit=mi
// /tours-within/300/center/14.619500, 74.835403./unit/mi
router
  .route('/tours-within/distance/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin)

router
  .route('/distances/:latlng/unit/:unit')
  .get(getDistances)

router
  .route('/')
  .get(getALLTours)
  .post(
    protectMiddleware,
    restrictToMiddleware('admin', 'lead-guide'),
    createTour
  );

router
  .route('/:id')
  .get(getTourById)
  .patch(
    protectMiddleware,
    restrictToMiddleware('admin', 'lead-guide'),
    upload.fields([
      { name: 'imageCover', maxCount: 1 },
      { name: 'images', maxCount: 3 },
    ]),
    resizeTourImages,
    updateTour)
  .delete(
    protectMiddleware,
    restrictToMiddleware('admin', 'lead-guide'),
    deleteTour
  );

// POST /tour/:tourId/reviews
// GET /tour/:tourId/reviews
// GET /tour/:tourId/reviews/reviewID

// router
//   .route('/:tourId/reviews')
//   .post(
//     protectMiddleware,
//     restrictToMiddleware('user'),
//     createReview,
//   )

export default router;


