# Advanced Features Payments, Email, File Uploads

#### IMAGE UPLOADS USING MUTER: USERS

```bash
  npm i multer #"multer": "^1.4.5-lts.1",
```

```js
import multer from 'multer';

const upload = multer({ dest: 'public/img/users' });

router.patch('/updateMe', upload.single('photo'), updateMe);
```

#### CONFIGURING MULTER

```js
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

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/3-Natours/public/img/users');
  },
  filename: (req, file, cb) => {
    // user-565454654-s45dsv4.jpeg
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

export const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// export const upload = multer(
//   { dest: 'src/3-Natours/public/img/users' }
// );
```

#### SAVING IMAGE NAME TO DATABASE

```js
const updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);

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

  ////////////////////
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }
  //////////////

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});
```

#### RESIZING IMAGES

```bash
npm i sharp
```

```js
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
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

export const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// export const upload = multer(
//   { dest: 'src/3-Natours/public/img/users' }
// );
```

```js
router.patch('/updateMe', upload.single('photo'), resizeUserPhoto, updateMe);
```

```js
import sharp from 'sharp';

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
```

#### ADDING IMAGE UPLOADS TO FORM

```pug
        //- With Api
        form.form.form-user-data
          .form__group
            label.form__label(for='name') Name
            input#name.form__input(type='text', value=`${user.name}`, required ,name='name')
          .form__group.ma-bt-md
            label.form__label(for='email') Email address
            input#email.form__input(type='email', value=`${user.email}`, required, name='email')
          .form__group.form__photo-upload
            img.form__user-photo(src=`/img/users/${user.photo}`, alt='User photo')
            input.form__upload(type='file', accept='image/*' ,id='photo', name='photo')
            label.btn-text(for='photo') Choose new photo
            //- a.btn-text(href='') Choose new photo

          .form__group.right
            button.btn.btn--small.btn--green Save settings

      .line &nbsp;
```

```js
if (userDataForm) {
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;
    // updateSettings({ name, email }, "data");

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    console.log(form);

    updateSettings(form, 'data');
  });
}
```

#### UPLOADING MULTIPLE IMAGES: TOURS

```js
router.use(
  '/:id',
  protectMiddleware,
  restrictToMiddleware('admin', 'lead-guide'),
  upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
  ]),
  resizeTourImages,
  updateTour
);

const resizeTourImages = (req, res, next) => {
  if (!req.file) return next();
  next();
};
```

#### PROCESSING MULTIPLE IMAGES

```js
const resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1. Cover images
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imagesCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`src/3-Natours/public/img/tours/${req.body.imageCover}`);

  // 2. Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`src/3-Natours/public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});
```

#### BUILDING A COMPLEX EMAIL HANDLER

```bash
npm i html-to-text
```

```js
import nodemailer from 'nodemailer';
import pug from 'pug';
import htmlToText from 'html-to-text';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Jonas <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Send Grid
      return 1;
    }

    return nodemailer.createTransport({
      // service: "Gmail",
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Activate in Gmail "less secure app" option
    });
  }

  // Send the Actual Email
  async send(template, subject) {
    // 1) Render HTML Based on a pug template.
    const html = pug.renderFile(`${__dirname}/..views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define Email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText.fromString(html),
    };

    // 3) Create a Transport and Send Email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }
}

export { Email };
```

```js
// import nodemailer from 'nodemailer';

// const sendEmail = async (options) => {
// 1) Create a transporter

// const transporter = nodemailer.createTransport({
//   // service: "Gmail",
//   host: process.env.MAILTRAP_HOST,
//   port: process.env.MAILTRAP_PORT,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   // Activate in Gmail "less secure app" option
// })

// 2) Define the email options

//   const mailOptions = {
//     from: "ABC <hello.jonas.io>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     html: options.message,
//   }

//   // 3) Actually send the email
//   // const emails = await transporter.sendMail(mailOptions);
//   // console.log(emails);

//   await transporter.sendMail(mailOptions);
// }

// const generateResetPasswordEmail = (resetURL) => {
//   return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Forgot Password</title>
//     </head>
//     <body style="font-family: Arial, sans-serif;">
//       <div style="background-color: #f2f2f2; padding: 20px;">
//         <h2 style="color: #333;">Forgot your password?</h2>
//         <p style="color: #666;">If you've forgotten your password, please submit a Patch request with your new password and password confirmation by clicking the button below:</p>
//         <a href="${resetURL}" style="background-color: blue; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px; margin-top: 15px;">Reset Password</a>
//         <p style="color: #666; margin-top: 20px;">If you didn't forget your password, please ignore this email.</p>
//       </div>
//     </body>
//     </html>`;
// };

// export { sendEmail, generateResetPasswordEmail };
```

#### EMAIL TEMPLATES WITH PUG: WELCOME EMAILS

```pug
style.
  img {
    border: none;
    -ms-interpolation-mode: bicubic;
    max-width: 100%;
  }
  body {
    background-color: #f6f6f6;
    font-family: sans-serif;
    -webkit-font-smoothing: antialiased;
    font-size: 14px;
    line-height: 1.4;
    margin: 0;
    padding: 0;
    -ms-text-size-adjust: 100%;
    -webkit-text-size-adjust: 100%;
  }
  table {
    border-collapse: separate;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
    width: 100%; }
    table td {
      font-family: sans-serif;
      font-size: 14px;
      vertical-align: top;
  }
  .body {
    background-color: #f6f6f6;
    width: 100%;
  }
  .container {
    display: block;
    margin: 0 auto !important;
    /* makes it centered */
    max-width: 580px;
    padding: 10px;
    width: 580px;
  }
  .content {
    box-sizing: border-box;
    display: block;
    margin: 0 auto;
    max-width: 580px;
    padding: 10px;
  }
  .main {
    background: #ffffff;
    border-radius: 3px;
    width: 100%;
  }
  .wrapper {
    box-sizing: border-box;
    padding: 20px;
  }
  .content-block {
    padding-bottom: 10px;
    padding-top: 10px;
  }
  .footer {
    clear: both;
    margin-top: 10px;
    text-align: center;
    width: 100%;
  }
    .footer td,
    .footer p,
    .footer span,
    .footer a {
      color: #999999;
      font-size: 12px;
      text-align: center;
  }
  h1,
  h2,
  h3,
  h4 {
    color: #000000;
    font-family: sans-serif;
    font-weight: 400;
    line-height: 1.4;
    margin: 0;
    margin-bottom: 30px;
  }
  h1 {
    font-size: 35px;
    font-weight: 300;
    text-align: center;
    text-transform: capitalize;
  }
  p,
  ul,
  ol {
    font-family: sans-serif;
    font-size: 14px;
    font-weight: normal;
    margin: 0;
    margin-bottom: 15px;
  }
    p li,
    ul li,
    ol li {
      list-style-position: inside;
      margin-left: 5px;
  }
  a {
    color: #55c57a;
    text-decoration: underline;
  }
  .btn {
    box-sizing: border-box;
    width: 100%; }
    .btn > tbody > tr > td {
      padding-bottom: 15px; }
    .btn table {
      width: auto;
  }
    .btn table td {
      background-color: #ffffff;
      border-radius: 5px;
      text-align: center;
  }
    .btn a {
      background-color: #ffffff;
      border: solid 1px #55c57a;
      border-radius: 5px;
      box-sizing: border-box;
      color: #55c57a;
      cursor: pointer;
      display: inline-block;
      font-size: 14px;
      font-weight: bold;
      margin: 0;
      padding: 12px 25px;
      text-decoration: none;
      text-transform: capitalize;
  }
  .btn-primary table td {
    background-color: #55c57a;
  }
  .btn-primary a {
    background-color: #55c57a;
    border-color: #55c57a;
    color: #ffffff;
  }
  .last {
    margin-bottom: 0;
  }
  .first {
    margin-top: 0;
  }
  .align-center {
    text-align: center;
  }
  .align-right {
    text-align: right;
  }
  .align-left {
    text-align: left;
  }
  .clear {
    clear: both;
  }
  .mt0 {
    margin-top: 0;
  }
  .mb0 {
    margin-bottom: 0;
  }
  .preheader {
    color: transparent;
    display: none;
    height: 0;
    max-height: 0;
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    mso-hide: all;
    visibility: hidden;
    width: 0;
  }
  .powered-by a {
    text-decoration: none;
  }
  hr {
    border: 0;
    border-bottom: 1px solid #f6f6f6;
    margin: 20px 0;
  }
  @media only screen and (max-width: 620px) {
    table[class=body] h1 {
      font-size: 28px !important;
      margin-bottom: 10px !important;
    }
    table[class=body] p,
    table[class=body] ul,
    table[class=body] ol,
    table[class=body] td,
    table[class=body] span,
    table[class=body] a {
      font-size: 16px !important;
    }
    table[class=body] .wrapper,
    table[class=body] .article {
      padding: 10px !important;
    }
    table[class=body] .content {
      padding: 0 !important;
    }
    table[class=body] .container {
      padding: 0 !important;
      width: 100% !important;
    }
    table[class=body] .main {
      border-left-width: 0 !important;
      border-radius: 0 !important;
      border-right-width: 0 !important;
    }
    table[class=body] .btn table {
      width: 100% !important;
    }
    table[class=body] .btn a {
      width: 100% !important;
    }
    table[class=body] .img-responsive {
      height: auto !important;
      max-width: 100% !important;
      width: auto !important;
    }
  }
  @media all {
    .ExternalClass {
      width: 100%;
    }
    .ExternalClass,
    .ExternalClass p,
    .ExternalClass span,
    .ExternalClass font,
    .ExternalClass td,
    .ExternalClass div {
      line-height: 100%;
    }
    .apple-link a {
      color: inherit !important;
      font-family: inherit !important;
      font-size: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
      text-decoration: none !important;
    }
    .btn-primary table td:hover {
      background-color: #2e864b !important;
    }
    .btn-primary a:hover {
      background-color: #2e864b !important;
      border-color: #2e864b !important;
    }
  }

```

```pug
//- Email template adapted from https://github.com/leemunroe/responsive-html-email-template
//- Converted from HTML using https://html2pug.now.sh/

doctype html
html
  head
    meta(name='viewport', content='width=device-width')
    meta(http-equiv='Content-Type', content='text/html; charset=UTF-8')
    title= subject

  include _style

  body
    table.body(role='presentation', border='0', cellpadding='0', cellspacing='0')
      tbody
        tr
          td
          td.container
            .content
              // START CENTERED WHITE CONTAINER
              table.main(role='presentation')

                // START MAIN AREA
                tbody
                  tr
                    td.wrapper
                      table(role='presentation', border='0', cellpadding='0', cellspacing='0')
                        tbody
                          tr
                            td
                              // CONTENT
                            block content

              // START FOOTER
              .footer
                table(role='presentation', border='0', cellpadding='0', cellspacing='0')
                  tbody
                    tr
                      td.content-block
                        span.apple-link Natours Inc, 123 Nowhere Road, San Francisco CA 99999
                        br
                        |  Don't like these emails?
                        a(href='#') Unsubscribe
          //- td  

```

```pug
extends baseEmail

block content
  p Hi #{firstName},
    p Welcome to Natours, we're glad to have you 🎉🙏
    p We're all a big familiy here, so make sure to upload your user photo so we get to know you a bit better!
    table.btn.btn-primary(role='presentation', border='0', cellpadding='0', cellspacing='0')
      tbody
        tr
          td(align='left')
            table(role='presentation', border='0', cellpadding='0', cellspacing='0')
              tbody
                tr
                  td
                    a(href=`${url}`, target='_blank') Upload user photo
    p If you need any help with booking your next tour, please don't hesitate to contact me!
    p - Jonas Schmedtmann, CEO
```

```js
import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Jonas <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Send Grid
      return 1;
    }

    return nodemailer.createTransport({
      // service: "Gmail",
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Activate in Gmail "less secure app" option
    });
  }

  // Send the Actual Email
  async send(template, subject) {
    // 1) Render HTML Based on a pug template.
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define Email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText(html),
    };

    // 3) Create a Transport and Send Email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }
}

export { Email };

// import nodemailer from 'nodemailer';

// const sendEmail = async (options) => {
// 1) Create a transporter

// const transporter = nodemailer.createTransport({
//   // service: "Gmail",
//   host: process.env.MAILTRAP_HOST,
//   port: process.env.MAILTRAP_PORT,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   // Activate in Gmail "less secure app" option
// })

// 2) Define the email options

//   const mailOptions = {
//     from: "ABC <hello.jonas.io>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     html: options.message,
//   }

//   // 3) Actually send the email
//   // const emails = await transporter.sendMail(mailOptions);
//   // console.log(emails);

//   await transporter.sendMail(mailOptions);
// }

// const generateResetPasswordEmail = (resetURL) => {
//   return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Forgot Password</title>
//     </head>
//     <body style="font-family: Arial, sans-serif;">
//       <div style="background-color: #f2f2f2; padding: 20px;">
//         <h2 style="color: #333;">Forgot your password?</h2>
//         <p style="color: #666;">If you've forgotten your password, please submit a Patch request with your new password and password confirmation by clicking the button below:</p>
//         <a href="${resetURL}" style="background-color: blue; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px; margin-top: 15px;">Reset Password</a>
//         <p style="color: #666; margin-top: 20px;">If you didn't forget your password, please ignore this email.</p>
//       </div>
//     </body>
//     </html>`;
// };

// export { sendEmail, generateResetPasswordEmail };
```

```js
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
});
```

#### SENDING PASSWORD RESET EMAILS

```pug
extends baseEmail

block content
  p Hi #{firstName},
  p Forgot your password? Submit a Patch request with your new password and passwordConfirm to : #{url}.
  p (Website for this action not yet implemented.)
  table.btn.btn-primary(role='presentation', border='0', cellpadding='0', cellspacing='0')
    tbody
      tr
        td(align='left')
          table(role='presentation', border='0', cellpadding='0', cellspacing='0')
            tbody
              tr
                td
                  a(href=`${url}`, target='_blank') Reset your password
  p if you did'nt forget your password, please ignore this email!!!
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
```

#### USING SEND-GRID FOR 'REAL' EMAILS

```js
import nodemailer from 'nodemailer';
import pug from 'pug';
import { htmlToText } from 'html-to-text';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Jonas <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Send Grid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      // service: "Gmail",
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Activate in Gmail "less secure app" option
    });
  }

  // Send the Actual Email
  async send(template, subject) {
    // 1) Render HTML Based on a pug template.
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define Email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText(html),
    };

    // 3) Create a Transport and Send Email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'YOur password reset token (valid for only 10 min)'
    );
  }
}

export { Email };
```

#### CREDIT CARD PAYMENTS WITH STRIPE

#### INTEGRATING STRIPE INTO THE BACK-END

```js

```

```js

```

####

```js

```

####

```js

```

####

```js

```

####

```js

```

####

```js

```

####

```js

```
