/* global module */

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': './scripts/jest-babel-transformer.js',
  },
};
