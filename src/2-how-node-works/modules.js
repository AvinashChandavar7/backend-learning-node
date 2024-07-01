
const C = require('./test-module-1');
// const CC = require('./test-module-2');
const { add, mul, div } = require('./test-module-2');

const calc1 = new C();


console.log(calc1.add(5, 5));
// console.log(CC.add(5, 5));
console.log(add(5, 5));

// caching
require('./test-module-3')();
require('./test-module-3')();
require('./test-module-3')();


// Only In COMMON JS
// console.log(arguments);

// console.log(require('module').wrapper);

/**
[Arguments] {
  '0': {},
  '1': [Function: require] {
    resolve: [Function: resolve] { paths: [Function: paths] },
    main: {
      id: '.',
      path: 'C:\\Users\\Avinash\\OneDrive\\Desktop\\backend_node_express_mongodb\\src\\2-how-n
ode-works',
      exports: {},
      filename: 'C:\\Users\\Avinash\\OneDrive\\Desktop\\backend_node_express_mongodb\\src\\2-h
ow-node-works\\modules.js',
      loaded: false,
      children: [],
      paths: [Array]
    },
    extensions: [Object: null prototype] {
      '.js': [Function (anonymous)],
      '.json': [Function (anonymous)],
      '.node': [Function (anonymous)]
    },
    cache: [Object: null prototype] {
      'C:\\Users\\Avinash\\OneDrive\\Desktop\\backend_node_express_mongodb\\src\\2-how-node-wo
rks\\modules.js': [Object]
    }
  },
  '2': {
    id: '.',
    path: 'C:\\Users\\Avinash\\OneDrive\\Desktop\\backend_node_express_mongodb\\src\\2-how-nod
e-works',
    exports: {},
    filename: 'C:\\Users\\Avinash\\OneDrive\\Desktop\\backend_node_express_mongodb\\src\\2-how
-node-works\\modules.js',
    loaded: false,
    children: [],
    paths: [
      'C:\\Users\\Avinash\\OneDrive\\Desktop\\backend_node_express_mongodb\\src\\2-how-node-wo
rks\\node_modules',
      'C:\\Users\\Avinash\\OneDrive\\Desktop\\backend_node_express_mongodb\\src\\node_modules'
,
      'C:\\Users\\Avinash\\OneDrive\\Desktop\\backend_node_express_mongodb\\node_modules',    
      'C:\\Users\\Avinash\\OneDrive\\Desktop\\node_modules',
      'C:\\Users\\Avinash\\OneDrive\\node_modules',
      'C:\\Users\\Avinash\\node_modules',
      'C:\\Users\\node_modules',
      'C:\\node_modules'
    ]
  },
  '3': 'C:\\Users\\Avinash\\OneDrive\\Desktop\\backend_node_express_mongodb\\src\\2-how-node-w
orks\\modules.js',
  '4': 'C:\\Users\\Avinash\\OneDrive\\Desktop\\backend_node_express_mongodb\\src\\2-how-node-w
orks'
}



[
  '(function (exports, require, module, __filename, __dirname) { ',
  '\n});'
]
 */