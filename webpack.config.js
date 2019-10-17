const path = require('path');

module.exports = {
  entry: './app/frontend/index.js',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, './public/js'),
  },
};