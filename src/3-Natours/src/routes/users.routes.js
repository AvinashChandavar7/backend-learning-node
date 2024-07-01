import express from 'express';
import multer from 'multer';

import {
  signup,
  login,
  logout,

  forgotPassword,
  resetPassword,
  updatePassword,

  protectMiddleware,
  restrictToMiddleware,
} from '../controllers/auth.controller.js';

import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,

  getMe,

  resizeUserPhoto,
  updateMe,

  deleteMe,
} from "../controllers/users.controller.js"

import { upload } from '../middleware/multer.middleware.js';

// const upload = multer({ dest: 'src/3-Natours/public/img/users' })

const router = express.Router();

router.post("/signup", signup)
router.post("/login", login)
router.get("/logout", logout)

router.post("/forgotPassword", forgotPassword)
router.patch("/resetPassword/:token", resetPassword)


// * applies to below routes (protect middleware)
router.use(protectMiddleware)
// *

router.patch("/updateMyPassword", updatePassword)

router.get("/currentMe", getMe, getUserById)

router.patch(
  "/updateMe",
  upload.single('photo'),
  resizeUserPhoto,
  updateMe
)

router.delete("/deleteMe", deleteMe)

// * applies to below routes (restrict To Middleware)
router.use(restrictToMiddleware('admin'),)
// *

router
  .route('/')
  .get(getAllUsers)
  .post(createUser)

router
  .route('/:id')
  .get(getUserById)
  .patch(updateUser)
  .delete(deleteUser);

export default router;