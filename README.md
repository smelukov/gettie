# Gettie

[![Donate](https://img.shields.io/badge/Donate-PayPal-brightgreen)](https://www.paypal.com/paypalme/smelukov)

Gettie is a JS object coverage tool.

Originally it developed to extract redux store coverage
to find out which store branches were not used till the application works.

## Example

```js
const state = {
  foo: 123,
  bar: [456, { baz: 789 }],
  quux: 123
};

console.log(state.quux);
console.log(state.bar[1].baz);
```

It helps to find out that branches `foo` and `bar[0]` from the `state` were not used.
It may motivate you to think about what you can do to remove the unused branches.

For more information, please, see [core](packages/core) package.
