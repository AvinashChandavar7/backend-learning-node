import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { APIFeatures } from "./APIFeatures.js";

const handleFactory = {
  deleteOne:
    (Model) =>
      catchAsync(async (req, res, next) => {

        const id = req.params.id;
        const doc = await Model.findByIdAndDelete(id);

        if (!doc) {
          return next(new AppError('No Document found with that ID', 404));
        }

        res.status(200).json({ status: 'success', data: null });
      }),

  updateOne:
    (Model, ModelName) =>
      catchAsync(async (req, res, next) => {
        const id = req.params.id;

        const doc = await Model.findByIdAndUpdate(
          id, req.body, { new: true, runValidators: true },
        );

        if (!doc) {
          return next(new AppError('No Document found with that ID', 404));
        }

        const responseData = {};
        responseData[ModelName] = doc;

        res.status(200).json({ status: 'success', data: responseData });
      }),

  createOne:
    (Model, ModelName) =>
      catchAsync(async (req, res) => {
        const doc = await Model.create(req.body);

        // if (!doc) {
        //   return next(new AppError('No Document found with that ID', 404));
        // }

        const responseData = {};
        responseData[ModelName] = doc;

        res.status(201).json({ status: 'success', data: responseData });
      }),

  getOne:
    (Model, ModelName, popOptions) =>
      catchAsync(async (req, res, next) => {

        let query = await Model.findById(req.params.id);

        if (popOptions) query = query.populate(popOptions);

        const doc = await query;

        if (!doc) {
          return next(new AppError('No Document found with that ID', 404))
        }

        // const tours = await Tour.findOne({ _id: id });

        const responseData = {};
        responseData[ModelName] = doc;

        res.status(201).json({ status: 'success', data: responseData });
      }),

  getAll:
    (Model, ModelName) =>
      catchAsync(async (req, res) => {

        //to allow for nested GET reviews on tour (little hack)
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId }



        const features = new APIFeatures(Model.find(filter), req.query)
          .filter()
          .sort()
          .limitFields()
          .paginate()

        // const doc = await features.query.explain();
        const doc = await features.query;


        res.status(200)
          .json({
            status: 'success',
            results: doc.length,
            data: { [ModelName]: doc },
          });
      }),
};

export default handleFactory;