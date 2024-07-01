import http from 'http';
import fs from 'fs';
import url, { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { replaceTemplate } from './modules/replaceTemplate.js';

//! BUILDING A (VERY) SIMPLE API
const PORT = 8000;

const tempOverview = fs.readFileSync(`${__dirname}/templates/templates-overview.html`, "utf-8")
const tempProduct = fs.readFileSync(`${__dirname}/templates/templates-product.html`, "utf-8")
const tempCard = fs.readFileSync(`${__dirname}/templates/templates-card.html`, "utf-8")

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8")
const dataObj = JSON.parse(data);



const server = http.createServer((req, res) => {

  const { query, pathname } = url.parse(req.url, true)


  // Overview Page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    const cardsHtml = dataObj.map(
      el => replaceTemplate(tempCard, el)
    ).join("")
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml)

    res.end(output)
  }

  // Product Page
  else if (pathname === "/product") {

    const product = dataObj[query.id]
    const output = replaceTemplate(tempProduct, product)

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(output)
  }

  // API Page
  else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data)
  }

  // Not Found
  else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "Hello, world",
    })
    res.end('<h1>Page Not Found</h1>')
  }

});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Listening to requests on port http://127.0.0.1:${PORT}/`);
})







//////////////////////////////////////////


// import http from 'http';
// import fs from 'fs';
// import url, { fileURLToPath } from 'url';
// import { dirname } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const PORT = 8000;

// const templates = {
//   overview: fs.readFileSync(`${__dirname}/templates/templates-overview.html`, 'utf-8'),
//   product: fs.readFileSync(`${__dirname}/templates/templates-product.html`, 'utf-8'),
//   card: fs.readFileSync(`${__dirname}/templates/templates-card.html`, 'utf-8')
// };

// const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
// const dataObj = JSON.parse(data);

// const replaceTemplate = (template, product) => {
//   let output = template
//     .replace(/{%PRODUCTNAME%}/g, product.productName)
//     .replace(/{%ID%}/g, product.id)
//     .replace(/{%IMAGE%}/g, product.image)
//     .replace(/{%FROM%}/g, product.from)
//     .replace(/{%NUTRIENT%}/g, product.nutrient)
//     .replace(/{%QUANTITY%}/g, product.quantity)
//     .replace(/{%PRICE%}/g, product.price)
//     .replace(/{%DESCRIPTION%}/g, product.description);

//   if (!product.organic) {
//     output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');
//   }

//   return output;
// };

// const renderOverviewPage = () => {
//   const cardsHtml = dataObj.map(el => replaceTemplate(templates.card, el)).join('');
//   return templates.overview.replace('{%PRODUCT_CARDS%}', cardsHtml);
// };

// const renderProductPage = (productId) => {
//   const product = dataObj.find(item => item.id === parseInt(productId));
//   return product ? replaceTemplate(templates.product, product) : 'Product not found';
// };

// const server = http.createServer((req, res) => {
//   const { query, pathname } = url.parse(req.url, true);

//   switch (pathname) {
//     case '/':
//     case '/overview':
//       res.writeHead(200, { 'Content-Type': 'text/html' });
//       res.end(renderOverviewPage());
//       break;

//     case '/product':
//       res.writeHead(200, { 'Content-Type': 'text/html' });
//       res.end(renderProductPage(query.id));
//       break;

//     case '/api':
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(data);
//       break;

//     default:
//       res.writeHead(404, {
//         'Content-Type': 'text/html',
//         'my-own-header': 'Hello, world'
//       });
//       res.end('<h1>Page Not Found</h1>');
//   }
// });

// server.listen(PORT, '127.0.0.1', () => {
//   console.log(`Listening to requests on port http://127.0.0.1:${PORT}/`);
// });
