// eslint-disable-next-line no-undef
module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['prettier', 'import'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  env: {
    es6: true,
    browser: true,
  },
  rules: {
    'prettier/prettier': 'error',
  },
  overrides: [
    {
      files: ['**/*.spec.ts', '**/*.spec.js'],
      plugins: ['jest'],
      env: {
        'jest/globals': true,
      },
      globals: {
        jest: true,
        nsObj: false,
      },
    },
  ],
};
