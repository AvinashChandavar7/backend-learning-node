import mongoose from "mongoose"
import validator from "validator";
import bcrypt from "bcryptjs";

import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide a valid email."],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email."]
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ["admin", "user", "guide", "lead-guide"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide passwords."],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your passwords."],
    minlength: 8,
    validate: {
      // This only works on Create or Save!!!
      validator: function (el) {
        return el === this.password;
      },
      message: `Passwords are not the same!`
    }
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },

  active: { type: Boolean, default: true, select: false }
},
  { timestamps: true }
)

userSchema.pre("save", async function (next) {
  // only run this function if Password was actually modified or changed  
  if (!this.isModified("password")) {
    return next();
  }

  // hash the password with coast of 12 
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm fields
  this.passwordConfirm = undefined;

  next();
})

userSchema.pre("save", async function (next) {

  if (!this.isModified("password") || this.isNew) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;

  next();
})

userSchema.pre(/^find/, async function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } })

  next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

userSchema.methods.changePasswordAfter = async function (JWTTimestamp) {

  if (this.passwordChangedAt) {
    // console.log(this.passwordChangedAt, JWTTimestamp); // 2024-04-30T00:00:00.000Z 1714644635
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    // console.log(changedTimestamp, JWTTimestamp); // 2024-04-30T00:00:00.000Z 1714644635

    return JWTTimestamp < changedTimestamp;
    //  Return true if password changed after token issuance : true -> 100 < 200 ,false -> 300 < 200
  }

  return false; // Password not changed
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken =
    crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // console.log({ resetToken }, this.passwordResetToken, this.passwordResetExpires);
  // { resetToken: '0b095a40a87aa595506c9ef517987a956c6cc399209ac7a030a570fed328e2fb'}
  // {passwordResetToken : 1731a92c6d062bfc208eb775c023f0a35fd6e0be4ad307e3a94036425811aee6}  
  // {passwordResetExpires: 2024-05-02T11: 47: 34.411Z }

  return resetToken;
}

export const User = mongoose.model("User", userSchema)

