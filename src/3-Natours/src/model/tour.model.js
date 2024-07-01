import mongoose from "mongoose"
import slugify from "slugify"
import validator from "validator";

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A tour must have a name"],
    unique: true,
    trim: true,
    maxlength: [40, "A tour must have a less or equal then 40 characters"],
    minlength: [3, "A tour must have a less or equal then 40 characters"],
    // validate: [validator.isAlpha, 'Tour name must be only contain alpha characters']
  },
  slug: {
    type: String,
  },
  duration: {
    type: Number,
    required: [true, "A tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    required: [true, "A tour must have a group size"],
  },
  difficulty: {
    type: String,
    required: [true, "A tour must have a difficulty"],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: "Difficulty is either: easy, medium, difficult"
    }
  },
  ratingsAverage: {
    type: Number,
    default: 0,
    min: [1, "Rating must be above 1.0"],
    max: [5, "Rating must be below 5.0"],
    set: val => Math.round(val * 10) / 10, // ex: 4.66666 -> 46.6666 -> 47 -> 4.7
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, "A tour must have a price"]
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        // this only points to current doc on new document creation
        return val < this.price; // 100 < 200
      },
      message: "Discount price ({VALUE}) should be below regular price"
    }
  },
  summary: {
    type: String,
    required: [true, "A tour must have a summary"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "A tour must have a description"],
  },
  imageCover: {
    type: String,
    required: [true, "A tour must have a cover image"],
  },
  images: [{
    type: String,
  }],
  createdAt: { type: Date, default: Date.now() },
  startDates: [{ type: Date, }],
  secretTour: { type: Boolean, default: false },
  startLocation: {
    // GEO-JSON
    type: { type: String, default: 'Point', enum: ['Point'] },
    coordinates: [Number],
    address: String,
    description: String,
  },

  guides: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  locations: {
    type: { type: String, default: 'Point', enum: ['Point'] },
    coordinates: [Number],
    address: String,
    description: String,
    day: Number
  },
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// tourSchema.index({ price: 1 }) // index
tourSchema.index({ price: 1, ratingsAverage: -1 }) // compound index
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual(`durationWeeks`)
  .get(function () { return this.duration / 7 })


// virtual populate
tourSchema.virtual('reviews',
  { ref: 'Review', foreignField: 'tour', localField: '_id' }
)

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: "-__v -passwordChangedAt -createdAt -updatedAt"
  });

  next();
})

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
//   console.log(this.pipeline());
//   next()
// })


// DOCUMENT MIDDLEWARE :Runs before .save() and .create() not but for update()
// .save() is called hooks or middleware.
tourSchema.pre('save', function (next) {
  // console.log(this);
  this.slug = slugify(this.name, { lower: true })
  next();
})

//
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id))
//   this.guides = await Promise.all(guidesPromises);
//   next();
// })

// tourSchema.pre('save', function (next) {
//   console.log('Will save Document');

//   next();
// })

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// })


// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } })

  this.start = Date.now()
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

export const Tour = mongoose.model("Tour", tourSchema)

