/* global process module */

module.exports = (api) => {
  api.cache(() => process.env.NODE_ENV);

  return {
    presets: ['@babel/env'],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-private-methods',
    ],
  };
};
