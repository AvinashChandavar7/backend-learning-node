import express from 'express';

import {
  getOverview,
  getTour,
  getLoginForm,
  getSignUpForm,

  getAccount,

  updateUserData,
} from '../controllers/views.controller.js';

import {
  isLoggedInMiddleware,
  protectMiddleware
} from '../controllers/auth.controller.js';


const router = express.Router();

router.get('/me', protectMiddleware, getAccount)

router.post('/submit-user-data', protectMiddleware, updateUserData)


router.use(isLoggedInMiddleware)

router.get('/', getOverview)
router.get('/tour/:slug', getTour)

router.get('/login', getLoginForm)
router.get('/signup', getSignUpForm)

router.post('/submit-user-data', protectMiddleware, updateUserData)


export default router;