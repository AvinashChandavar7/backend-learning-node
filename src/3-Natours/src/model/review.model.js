import mongoose from "mongoose";
import { Tour } from "./tour.model.js";

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, "Review can not be empty!"]
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "Review must belong to a tour."]
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Review must belong to a user."]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true })

reviewSchema.pre(/^find/, function (next) {
  this
    // .populate({ path: 'tour', select: "name" })
    .populate({ path: 'user', select: "name photo" });

  next();
})

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      }
    }
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].numRating,
      ratingsQuantity: stats[0].avgRating,
    });
  }
}

reviewSchema.post("save", function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour)
  // Review.calcAverageRatings(this.tour)
})

// Pre hook for findOneAndUpdate and findOneAndDelete
reviewSchema.pre(/^findOneAnd/, async function () {
  this.r = await this.model.findOne(this.getQuery());
});

// Post hook for findOneAndUpdate and findOneAndDelete
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
});


export const Review = mongoose.model("Review", reviewSchema)


//-----

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.r = await this.findOne();
//   // console.log(this.r);
//   next();
// })

// reviewSchema.post(/^findOneAnd/, async function () {
//   // await this.findOne(); does not work here,query has already executed
//   await this.r.constructor.calcAverageRatings(this.r.tour);
// })

// --------

// // Pre hook for findOneAndUpdate
// reviewSchema.pre('findOneAndUpdate', async function () {
//   this.r = await this.model.findOne(this.getQuery());
// });

// // Post hook for findOneAndUpdate
// reviewSchema.post('findOneAndUpdate', async function () {
//   await this.r.constructor.calcAverageRatings(this.r.tour);
// });

// // Pre hook for findOneAndDelete
// reviewSchema.pre('findOneAndDelete', async function () {
//   this.r = await this.model.findOne(this.getQuery());
// });

// // Post hook for findOneAndDelete
// reviewSchema.post('findOneAndDelete', async function () {
//   await this.r.constructor.calcAverageRatings(this.r.tour);
// });
