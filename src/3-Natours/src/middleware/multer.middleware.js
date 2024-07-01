import multer from 'multer';
import { AppError } from '../utils/appError.js';


/** req.file
  // before
  {
    fieldname: 'photo',
    originalname: 'name.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: 'public/img/users',
    filename: 'e92fc0f1b4bd0ed5aa0cbbaf20779e9b',
    path: 'public\\img\\users\\e92fc0f1b4bd0ed5aa0cbbaf20779e9b',
    size: 121650
  }

  // after
  {
  fieldname: 'photo',
  originalname: 'name.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: 'src/3-Natours/public/img/users',
  filename: 'user-664624b083b0d70edc5c445c-1715972004437.jpeg',
  path: 'src\\3-Natours\\public\\img\\users\\user-664624b083b0d70edc5c445c-1715972004437.jpeg',
  size: 121650
}
 */

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'src/3-Natours/public/img/users')
//   },
//   filename: (req, file, cb) => {
//     // user-565454654-s45dsv4.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   },
// })

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  }
  else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
}



export const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// export const upload = multer(
//   { dest: 'src/3-Natours/public/img/users' }
// );


// 3 type of upload
// 1. upload.single('photo'),
// 2. upload.array('images',5),
// 3. upload.fields([
// { name: 'imageCover',maxCount: 1 },
// { name: 'images',maxCount: 3 },
// ])