import EvenEmitter from "events"
import http from 'http'

class Sales extends EvenEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new Sales();

myEmitter.on("newSales", () => {
  console.log("There was a new sales!");
})
myEmitter.on("newSales", () => {
  console.log("Consumer name : L");
})

myEmitter.on("newSales", stock => {
  console.log(`Theres are now ${stock} items left in stock.`);
});

myEmitter.emit("newSales", 9);


////////////////////////////////////////


const server = http.createServer();

server.on('request', (req, res) => {
  console.log(`Request received:`);
  console.log(req.url);
  res.end("Request received")
})

server.on('request', (req, res) => {
  console.log(req.url);
  console.log("Another Request received")
})

server.on('close', (req, res) => {
  console.log("server closed");
})

server.listen(8000, "127.0.0.1", () => {
  console.log("Waiting for requests..... http://127.0.0.1:8000 ");
})