import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Tour } from '../model/tour.model.js';
import { catchAsync } from '../utils/catchAsync.js';
// import { APIFeatures } from './APIFeatures.js';
import { AppError } from '../utils/appError.js';


import handleFactory from './handleFactory.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../../dev-data/data/tours-simple.json`)
);

// ! middleware
const aliasTopTours = async (req, res, next) => {
  req.query.limit = "5"
  req.query.sort = "-ratingsAverage,price"
  req.query.fields = "name,price,ratingsAverage,summary,difficulty"

  next();
}

// ! AGGREGATION PIPELINE: MATCHING AND GROUPING

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // _id: '$ratingsAverage',
        numTours: { $sum: 1 },
        numRating: { $avg: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $min: "$price" },
      }
    },
    {
      $sort: { avgPrice: 1 }
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ])

  res.status(200).json({ status: 'success', data: { stats } });
})

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;     //  __ * 1 -> thick convert into number

  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { numTourStarts: -1 } },
    { $limit: 12 }
  ]);

  res.status(200).json({ status: 'success', data: { plan }, });
})

//! TOURs

const getALLTours = handleFactory.getAll(Tour, "tours");
const getTourById = handleFactory.getOne(Tour, "tours", { path: "reviews" });
const createTour = handleFactory.createOne(Tour, "tours");
const updateTour = handleFactory.updateOne(Tour, "tours");
const deleteTour = handleFactory.deleteOne(Tour)

//

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

// /tours-distance/300/center/14.61,74.83/unit/mi
const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  if (!distance || !latlng || !unit) {
    return next(new AppError('Please provide distance, center, and unit in the request params', 400));
  }

  const [lat, lng] = latlng.split(',');

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;


  if (!lat || !lng) {
    return next(new AppError('Please provide a valid center in the format lat,lng', 400));
  }


  // console.log(distance, lat, lng, unit);

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat,], radius],
      }
    }
  })

  res.status(200).json({ status: 'success', results: tours.length, data: { tours } });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;

  if (!latlng || !unit) {
    return next(new AppError('Please provide latlng, and unit in the request params', 400));
  }

  const [lat, lng] = latlng.split(',');

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;


  if (!lat || !lng) {
    return next(new AppError('Please provide a valid center in the format lat,lng', 400));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng * 1, lat * 1] },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      }
    },
    { $project: { distance: 1, name: 1 } }
  ])


  res.status(200).json({ status: 'success', data: { distances } });
});



export {
  getALLTours,
  getTourById,
  createTour,

  resizeTourImages,
  updateTour,

  deleteTour,

  aliasTopTours,

  getTourStats,
  getMonthlyPlan,

  getToursWithin,
  getDistances,
}


//  2nd version ----------------------------------------------------------------


// ! Get All Tours
// const getALLTours = catchAsync(async (req, res) => {
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter().sort().limitFields().paginate()

//   const tours = await features.query;

//   res.status(200)
//     .json({ status: 'success', results: tours.length, data: { tours }, });
// })

// ! get Tour By Id
// const getTourById = catchAsync(async (req, res, next) => {

//   const tours = await Tour.findById(req.params.id).populate('reviews')

//   if (!tours) {
//     return next(new AppError('No tour found with that ID', 404))
//   }

//   // const tours = await Tour.findOne({ _id: id });

//   res.status(200).json({
//     status: 'success',
//     data: { tours },
//   });
// })

// ! create Tour
// const createTour = catchAsync(async (req, res) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201)
//     .json({ status: 'success', data: { tour: newTour } });
// })

// ! update tour
// const updateTour = catchAsync(async (req, res, next) => {
//   const id = req.params.id;
//   const tours = await Tour.findByIdAndUpdate(
//     id, req.body, { new: true, runValidators: true },
//   );

//   if (!tours) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({ status: 'success', data: { tours }, });
// })

// ! delete Tour
// const deleteTour = catchAsync(async (req, res, next) => {
//   const id = req.params.id;
//   const tours = await Tour.findByIdAndDelete(id);

//   if (!tours) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: { tours },
//   });
// })




//  1st version----------------------------------------------------------------


// const getALLTours = async (req, res) => {
//   try {

//     const features = new APIFeatures(Tour.find(), req.query)
//       .filter().sort().limitFields().paginate()

//     const tours = await features.query;

//     res.status(200).json({
//       status: 'success',
//       results: tours.length,
//       data: { tours },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'error',
//       message: error
//     });
//   }
// }



// const getTourById = async (req, res) => {
//   const id = req.params.id;
//   try {
//     const tours = await Tour.findById(id);
//     // const tours = await Tour.findOne({ _id: id });

//     res.status(200).json({
//       status: 'success',
//       data: { tours },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'error',
//       message: error.message
//     });
//   }
// }



// const createTour = async (req, res) => {
//   try {
//     const newTour = await Tour.create(req.body);
//     res
//       .status(201)
//       .json({
//         status: 'success',
//         data: { tour: newTour }
//       });
//   } catch (error) {
//     res
//       .status(404)
//       .json({
//         status: 'fail',
//         message: error.message
//       });
//   }
// }

// const updateTour = async (req, res) => {
//   const id = req.params.id;
//   try {
//     const tours = await Tour.findByIdAndUpdate(
//       id,
//       req.body,
//       { new: true, runValidators: true },
//     );

//     res.status(200).json({
//       status: 'success',
//       data: { tours },
//     });
//   } catch (error) {
//     res.status(404).json({
//       status: 'error',
//       message: error.message
//     });
//   }
// }

// const deleteTour = async (req, res) => {
//   const id = req.params.id;
//   try {
//     const tours = await Tour.findByIdAndDelete(id);

//     res.status(200).json({
//       status: 'success',
//       data: { tours },
//     });
//   } catch (error) {
//     res.status(404).json({ status: 'error', message: error.message });
//   }
// }

// const getTourStats = async (req, res) => {
//   try {

//     const stats = await Tour.aggregate([
//       {
//         $match: { ratingsAverage: { $gte: 4.5 } }
//       },
//       {
//         $group: {
//           _id: { $toUpper: '$difficulty' },
//           // _id: '$ratingsAverage',
//           numTours: { $sum: 1 },
//           numRating: { $avg: "$ratingsQuantity" },
//           avgRating: { $avg: "$ratingsAverage" },
//           avgPrice: { $avg: "$price" },
//           minPrice: { $min: "$price" },
//           maxPrice: { $min: "$price" },
//         }
//       },
//       {
//         $sort: { avgPrice: 1 }
//       },
//       // {
//       //   $match: { _id: { $ne: 'EASY' } }
//       // }
//     ])

//     res.status(200).json({ status: 'success', data: { stats }, });

//   } catch (error) {
//     res.status(404).json({ status: 'error', message: error.message });
//   }
// }

// const getMonthlyPlan = async (req, res) => {
//   try {
//     const year = req.params.year * 1;     //  __ * 1 -> thick convert into number

//     const plan = await Tour.aggregate([
//       { $unwind: '$startDates' },
//       {
//         $match: {
//           startDates: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           }
//         }
//       },
//       {
//         $group: {
//           _id: { $month: '$startDates' },
//           numTourStarts: { $sum: 1 },
//           tours: { $push: '$name' }
//         }
//       },
//       { $addFields: { month: '$_id' } },
//       { $project: { _id: 0 } },
//       { $sort: { numTourStarts: -1 } },
//       { $limit: 12 }
//     ]);

//     res.status(200).json({
//       status: 'success',
//       data: { plan },
//     });
//   } catch (error) {
//     res.status(404).json({ status: 'error', message: error.message });
//   }
// }
