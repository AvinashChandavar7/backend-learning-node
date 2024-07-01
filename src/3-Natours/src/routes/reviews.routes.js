import express from 'express';

import {
  createReview,
  getALLReviews,
  getReviewById,

  setTourUserIdsMiddleware,
  updateReview,
  deleteReview,
} from '../controllers/review.controller.js';

import {
  protectMiddleware,
  restrictToMiddleware
} from '../controllers/auth.controller.js';

const router = express.Router({ mergeParams: true });

// *
router.use(protectMiddleware,)
// *

router
  .route("/")
  .get(getALLReviews)
  .post(
    restrictToMiddleware('user'),
    setTourUserIdsMiddleware,
    createReview
  )

router
  .route("/:id")
  .get(getReviewById)
  .patch(restrictToMiddleware('user', "admin"), updateReview)
  .delete(restrictToMiddleware('user', "admin"), deleteReview)


export default router;

// POST /:tourId/reviews
// POST /reviews