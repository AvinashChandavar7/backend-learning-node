import { AppError } from "./appError.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {

  const errors = Object.values(err.errors).map(el => el.message)

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400)
}

const handleDuplicateFieldDB = (err) => {
  const value = err.errmsg.match(/([""'])(\\?.)*?\1/)[0];
  // console.log(value);
  const message = `Duplicate field value :${value}, Please use another value `;

  return new AppError(message, 400)
}

const handleJWTError = () => {
  return new AppError(`Invalid token. Please log in again`, 401)
}

const handleJWTExpiredError = () => {
  return new AppError(`Your token has expired! Please log in again`, 401)
}

const sendErrorDEV = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  } else {
    // RENDERED WEBSITE
    res.status(err.statusCode).render('error', {
      title: `Something went wrong`,
      msg: err.message,
    })
  }
}

const sendErrorProd = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    // Operational , trusted error : send message to client
    if (err.isOperational) {
      res.status(err.statusCode)
        .json({ status: err.status, message: err.message, });

    } else {
      // Programming or other unknown error : don't leak error details
      // 1) Log error
      console.log(`Error 🔥🔥🔥: ${err}`);

      // 2) Send general error message
      res.status(500)
        .json({ status: 'error', message: "Something went very wrong!", });
    }
    //
  } else {
    // RENDERED WEBSITE
    // Operational , trusted error : send message to client
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: `Something went wrong`,
        msg: err.message,
      })
    } else {
      // Programming or other unknown error : don't leak error details
      // 1) Log error
      console.log(`Error 🔥🔥🔥: ${err}`);

      // 2) Send general error message
      res.status(err.statusCode).render('error', {
        title: `Something went wrong`,
        msg: `Please try again later`,
      })
    }
    //
  }
}

export const errorHandler = (err, req, res, next) => {
  // console.log(err.stack);

  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {

    sendErrorDEV(err, req, res)
  }
  else if (process.env.NODE_ENV === 'production') {

    let error = { ...err }
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();


    sendErrorProd(err, req, res)
  }
};

