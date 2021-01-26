/* global module, require, process */

const path = require('path');

function generate(options = {}) {
  const mode =
    options.mode ||
    (process.env.NODE_ENV === 'production' ? 'production' : 'development');
  const output = options.output || {};

  return {
    mode,
    target: 'browserslist',
    devtool: mode === 'production' ? false : 'source-map',
    entry: './lib/index.js',
    output: {
      path: path.resolve(output.path || 'dist'),
      filename: output.filename || '[name].js',
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
  generate(),
  generate({
    mode: 'development',
    output: {
      filename: '[name].dev.js',
    },
  }),
];
