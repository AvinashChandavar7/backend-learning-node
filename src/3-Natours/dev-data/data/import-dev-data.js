import dotenv from "dotenv"
dotenv.config()

import mongoose from "mongoose";
import { Tour } from "./../../src/model/tour.model.js"
import { User } from "./../../src/model/user.model.js"
import { Review } from "./../../src/model/review.model.js"

import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


mongoose
  .connect("mongodb://localhost:27017/natours")
  // .connect(process.env.MONGODB_URL_LOCAL)
  // .connect(process.env.MONGODB_URL)
  .then((con) => console.log(con.connection.host + " is Connected to Mongo DB"));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf8'))

// IMPORTING ALL DATA FROM DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("Data Successfully imported");
  } catch (error) {
    console.log(error);
  }
  process.exit();
}

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data  Successfully delete");
  } catch (error) {
    console.log(error);
  }
  process.exit();
}


if (process.argv[2] === "--import") {
  importData();
}
if (process.argv[2] === "--delete") {
  deleteData();
}
console.log(process.argv);


// cd src/3-Natours/dev-data/data
//  node import-dev-data.js --import
//  node import-dev-data.js --delete