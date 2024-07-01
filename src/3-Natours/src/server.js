import dotenv from "dotenv"
import mongoose from "mongoose";
import { app } from "./app.js";
// import { Tour } from "./model/tour.model.js";

dotenv.config()


process.on("uncaughtException", () => {
  console.log(`Uncaught exception 🔥🔥🔥 Shutting down..`);
  console.log(err.name, err.message);
  process.exit(1);
})

mongoose
  .connect(process.env.MONGODB_URL_LOCAL)
  // .connect(process.env.MONGODB_URL)
  .then((con) => console.log(con.connection.host + " is Connected to Mongo DB"));



// const testTour = new Tour({
//   name: 'The Parks and Forest Hiker',
//   price: 497,
//   rating: 4.7,
// })

// testTour
//   .save()
//   .then(document => console.log(document))
//   .catch(error => console.log(error.message))


const PORT = process.env.PORT || 8000

const server = app.listen(PORT, () => {
  console.log(`listening on http://127.0.0.1:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`Unhandled rejection 🔥🔥🔥 Shutting down..`);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  })
})






// console.log(app.get('env'));
// console.log(process.env);
// console.log(process.env.PORT);


// mongoose.connect(process.env.MONGODB_URL)
//   .then((con) => {
//     console.log(con.connection.port)
//     console.log(con.connection.models)
//     console.log(con.connection.host)
//     console.log(con.connection.name)
//   });