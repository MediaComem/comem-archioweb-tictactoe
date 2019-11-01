const path = require('path');

module.exports = {
  entry: './app/frontend/index.js',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, './public/js'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
    ],
  },
  performance: {
    maxAssetSize: 1024 * 1024,
    maxEntrypointSize: 512 * 1024
  }
};