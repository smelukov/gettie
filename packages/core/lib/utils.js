import Gettie from './gettie';

export function hasOwnProperty(obj, name) {
  return Object.hasOwnProperty.call(obj, name);
}

export function shouldBeIgnored(obj, key) {
  if (obj[Gettie.ignoreSymbol] === true) {
    return true;
  }

  if (key) {
    if (typeof key === 'symbol') {
      return true;
    }

    if (
      Array.isArray(obj[Gettie.ignoreSymbol]) &&
      obj[Gettie.ignoreSymbol].includes(key)
    ) {
      return true;
    }

    if (obj[key] != null && obj[key][Gettie.ignoreSymbol] === true) {
      return true;
    }
  }

  return false;
}

export function isObjectOrArray(item) {
  return item && (item.constructor === Object || Array.isArray(item));
}

export function shallowCloneIfImmutable(data) {
  const isObj = data && data.constructor === Object;
  const descriptors = Object.getOwnPropertyDescriptors(data);

  for (const name in descriptors) {
    const descriptor = descriptors[name];
    if (!descriptor.writable && !descriptor.configurable) {
      return isObj ? { ...data } : [...data];
    }
  }

  return data;
}
