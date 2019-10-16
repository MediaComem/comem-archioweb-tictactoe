const path = require('path');

module.exports = {
  entry: './app/frontend/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, './public/js'),
  },
};