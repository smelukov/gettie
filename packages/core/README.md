# @gettie/core

[![npm version](https://badge.fury.io/js/%40gettie%2Fcore.svg)](https://badge.fury.io/js/%40gettie%2Fcore)

Core package for [Gettie](https://github.com/smelukov/gettie).

## Installation

```sh
npm install @gettie/core --save
```

## Usage

```js
import Gettie from '@gettie/core';

const state = {
  foo: 123,
  bar: [456, { baz: 789 }],
  quux: 123
};

const gettie = new Gettie();
const wrappedState = gettie.update(state);

console.log(wrappedState.quux);
console.log(wrappedState.bar[1].baz);

console.log(gettie.coverage());
```

Output:
```
123
789
{
  "branches": {
    "all": [
      ["foo"],
      ["bar"],
      ["bar", 0],
      ["bar", 1],
      ["bar", 1, "baz"],
      ["quux"]
    ],
    "used": [
      ["quux"],
      ["bar"],
      ["bar", "1"],
      ["bar", "1", "baz"]
    ],
    "unused": [
      ["foo"],
      ["bar", 0]
    ]
  },
  "data": {
    "all": __original_state_here__,
    "used": {
      "bar": [null, { "baz": 789 }],
      "quux": 123
    },
    "unused": {
      "foo": 123,
      "bar": [456]
    }
  }
}
```

## How it works

Gettie creates a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) for an object (target) which you want to collect usage stats.

This proxy intercept any access to a property and mark path to it as used

If the property's value is an object or array, then it will be wrapped by another proxy, and so on. 

> To collect usage stats, all accessing the properties of the original object should be performed through this proxy

**Wrong:**
```js
const state = { ... };

const gettie = new Gettie();
const wrapped = gettie.update(state);

console.log(state.foo); // << wrong! `wrapped` should be used
console.log(gettie.coverage());
```

**Ok:**
```js
const state = { ... };

const gettie = new Gettie();
const wrapped = gettie.update(state);

console.log(wrapped.foo); // << OK
console.log(gettie.coverage());
```

### Coverage format

`Branch` is a path to the property, separated into parts.

`foo.bar.baz` is `['foo', 'bar', 'baz']`

All usage stats contains:

- branches
  - all the branches
  - used branches
  - unused object branches
- data
  - original data
  - used data
  - unused data
  
Used and unused data is a snapshot of the values by used/unused branches of the target object.

```typescript
type Branch = string[];

type Coverage<T> = {
  branches: {
    all: Branch[],
    used: Branch[],
    unused: Branch[],
  },
  data: {
    all: T,
    used: any,
    unused: any,
  }
};
```

## API

### Gettie(data?: object)

Create Gettie instance.

```js
const obj = { foo: 123, bar: 456 };

const gettie = new Gettie();
const wrapped = gettie.update(obj);
// or
const gettie = new Gettie(obj);
const wrapped = gettie.get();
```

### coverage(): Coverage

Extract usage stats from the instance.

```js
const gettie = new Gettie({ foo: 123, bar: 456 });
const wrapped = gettie.get();

console.log(wrapped.foo.bar);
console.log(gettie.coverage())
```

### update(data: object, reset?: bool = false): Proxy

Set a new object for collecting usage stats and return a proxy for this object.

> To collect usage stats, all accessing the properties of the original object should be performed through this proxy

If `reset` is `true`, then reset already collected usage stats (`false` by default).

```js
const gettie = new Gettie();

let wrapped = gettie.update({ foo: 123, bar: 456 });
console.log(wrapped.foo);
console.log(wrapped.bar);

wrapped = gettie.update({ baz: 123, quux: 456 });
console.log(wrapped.baz);
console.log(wrapped.quux);

console.log(gettie.coverage().branches.used); // [['foo'], ['bar'], ['baz'], ['quux']]
```  

### get(): Proxy

Get a proxy for the current watching object.

> To collect usage stats, all accessing the properties of the original object should be performed through this proxy

```js
const gettie = new Gettie({ foo: 123, bar: 456 });
const wrapped = gettie.get();

console.log(wrapped.foo);
console.log(wrapped.bar);
```

### reset(data?: object)

Reset collected usage stats.
If `data` were passed, then `update(data)` will be called after reset.

```js
const gettie = new Gettie();
const wrapped = gettie.update({ foo: 123, bar: 456 });

console.log(wrapped.foo);
console.log(wrapped.bar);
console.log(gettie.coverage().branches.usage); // [['foo'], ['bar']] 

gettie.reset();
console.log(gettie.coverage().branches.usage); // [] 
```

### unwrap(): object

Get an original object under a proxy.

```js
const gettie = new Gettie({ foo: 123, bar: 456 });
const wrapped = gettie.get();

console.log(wrapped); // Proxy({ foo: 123, bar: 456 })
console.log(gettie.unwrap()); // { foo: 123, bar: 456 }
```

### lock()

Lock the instance for usage stats collecting.

```js
const gettie = new Gettie();
const wrapped = gettie.update({ foo: 123, bar: 456 });

gettie.lock();
console.log(wrapped.foo);
console.log(wrapped.bar);
console.log(gettie.coverage().branches.usage); // [] 
```

### unlock()

Unlock the instance for usage stats collecting.

```js
const gettie = new Gettie();
const wrapped = gettie.update({ foo: 123, bar: 456 });

gettie.lock();
console.log(wrapped.foo);
console.log(wrapped.bar);
console.log(gettie.coverage().branches.usage); // []

gettie.unlock();
console.log(wrapped.foo);
console.log(wrapped.bar);
console.log(gettie.coverage().branches.usage); // [['foo'], ['bar']]
```

### locked(): boolean

Return `true` if the instance is locked.

### wrapFn(fn: (...args) => R, lock: bool = true): (...args) => R

Create a function that will update the instance by `fn`-returned value.

```js
import { createStore } from 'redux';
const gettie = new Gettie();
const gettieReducer = gettie.wrapFn((state, action) => reducer(state, action));
const store = createStore(gettieReducer, { foo: 123, bar: 456 });
```

The instance will be locked before calling fn and unlocked after it.

Pass `false` to `lock` to prevent lock.

### Gettie.ignoreSymbol

Allow to ignore a whole object or it's properties from usage stats collecting.

```js
const gettie = new Gettie();
const wrapped = gettie.update({ 
  foo: 123, 
  bar: {
    [Gettie.ignoreSymbol]: true,
    baz: 456
  }
});

console.log(wrapped.foo);
console.log(wrapped.bar.baz);

console.log(gettie.coverage()); // [['foo']]
```

`bar.baz` will not be marked as `used` because `bar` has `ignoreSymbol`.

```js
const gettie = new Gettie();
const wrapped = gettie.update({
  [Gettie.ignoreSymbol]: ['bar', 'baz'], 
  foo: 123, 
  bar: 456,
  baz: 789
});

console.log(wrapped.foo);
console.log(wrapped.bar);
console.log(wrapped.baz);

console.log(gettie.coverage()); // [['foo']]
```

`bar` and `baz` will not be marked as `used` because these are marked as ignored.

## Ok, Ok! What should I do to figure out which data in my redux store unused?

See [this example](https://codesandbox.io/s/unused-redux-state-viewer-sxvex).

This is a little bit modified classic todo-list application.

Every todo has `createdTS` and `editedTS` fields that are not used.

Add or edit some todos and click to the `Refresh` link to see unused branches and data.
