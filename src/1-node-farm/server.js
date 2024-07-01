// import fs from 'fs';

//////////////////////////////////////////////////////////////
//! BLOCKING, Synchronous way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8")
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}. \n Created on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut)

//! NON-BLOCKING, Asynchronous way

// 1.
// fs.readFile("./txt/start.txt", "utf-8", (err, data) => {
//   console.log(data); ''
// });
// // 2.
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//   });
// });
// // 3.
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//     fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
//       console.log(data3);
//     });
//   });
// });
// // 4.
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {

//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);

//     fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
//       console.log(data3);

//       fs.writeFile(`./txt/final.txt`, `${data2}\n\n${data3}`, "utf-8", (err) => {
//         console.log("Your File has been written");
//       });
//     });
//   });
// });
// 5.
// fs.readFile("./txt/startt.txt", "utf-8", (err, data1) => {

//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     if (err) return console.log("Error!");

//     fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
//       console.log(data3);

//       fs.writeFile(`./txt/final.txt`, `${data2}\n\n${data3}`, "utf-8", (err) => {
//         console.log("Your File has been written");
//       });
//     });
//   });
// });


// console.log("Will read file");

////////////////////////////////////////////////////////////
// import http from 'http';
// import url from 'url';


// //! A SIMPLE WEB SERVER
// const PORT = 8000;
// const server = http.createServer(
//   (req, res) => {
//     console.log(req.url);
//     res.end("Hello from the server!");
//   }
// );

// server.listen(PORT, '127.0.0.1', () => {
//   console.log(`Listening to requests on port http://127.0.0.1:8000/`);
// })

////////////////////////////////////////////////////////////

import http from 'http';
import url from 'url';

//! Routes
const PORT = 8000;
const server = http.createServer((req, res) => {
  const pathName = req.url;

  if (pathName === "/" || pathName === "/overview") {
    res.end("this is the overview")
  } else if (pathName === "/product") {
    res.end("this is the product")
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "Hello, world",
    })
    res.end("Hello From the Server")
  }

});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Listening to requests on port http://127.0.0.1:${PORT}/`);
})