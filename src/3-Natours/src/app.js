import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean'
import hpp from 'hpp';



import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

import { AppError } from './utils/appError.js';
import { errorHandler } from './utils/errorHandler.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, "views"));

// Serving  static files
app.use(express.static(`${__dirname}/../public/`))
// app.use(express.static(path.join(__dirname, 'public')));


// 1) Global MIDDLEWARES

// Set Security HTTP headers
// app.use(helmet())
// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//   })
// );

// Body parser ,reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data Sanitization against XSS (cross-site scripting) with html code
app.use(xss());

// Prevent parameter pollution (whitelist with example)
app.use(hpp(
  { whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'] }
));

// cors
app.use(cors("*"))

// Development logging
if (process.env.NODE_ENV !== 'development') {
  app.use(morgan('dev'))
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests for this IP, Please try again in an hour.',
})

app.use('/api', limiter)



// middleware
// app.use((req, res, next) => {
//    console.log("hello from the middleware");
//   next();
// })
// middleware
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
// console.log(req.cookies);
//   next();
// })

import tourRouter from "./routes/tours.routes.js"
import usersRouter from "./routes/users.routes.js"
import reviewRouter from "./routes/reviews.routes.js"
import viewsRouter from "./routes/views.routes.js"



app.use('/', viewsRouter)
app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/reviews', reviewRouter)


app.all('*', (req, res, next) => {

  // 1.
  // res.status(404).json({
  //   status: "Failed",
  //   message: `Can't find ${req.originalUrl} on this server`
  // })

  // 2.
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // 3.
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));


})

app.use(errorHandler);


export { app };



