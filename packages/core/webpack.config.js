/* global module, require, process */

const path = require('path');

function generate(options) {
  return {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
    entry: './lib/index.js',
    output: {
      path: path.resolve(options.output.path),
      library: 'Gettie',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              rootMode: 'upward',
            },
          },
        },
      ],
    },
  };
}

module.exports = [
  generate({
    output: {
      path: 'dist',
    },
    useBabel: true,
  }),
];
