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
    this.from = `Jonas <${process.env.EMAIL_FROM}>`
  }

  newTransport() {
    // if (process.env.NODE_ENV === 'production') {
    //   // Send Grid
    //   return nodemailer.createTransport({
    //     service: "SendGrid",
    //     auth: {
    //       user: process.env.SENDGRID_USERNAME,
    //       pass: process.env.SENDGRID_PASSWORD,
    //     },
    //   });
    // }
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
    })
  }

  // Send the Actual Email
  async send(template, subject) {
    // 1) Render HTML Based on a pug template.
    const html = pug.renderFile(
      `${__dirname}/../views/email/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject
      }
    )

    // 2) Define Email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText(html),
    }

    // 3) Create a Transport and Send Email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'YOur password reset token (valid for only 10 min)');
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


