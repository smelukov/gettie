import Gettie from './gettie';
import { shallowCloneIfImmutable, shouldBeIgnored } from './utils';

describe('shallowCloneIfImmutable', () => {
  it('should clone', () => {
    const obj = {
      foo: {
        bar: 123,
      },
      bar: 456,
    };
    Object.defineProperty(obj, 'aaa', {
      configurable: false,
      writable: false,
      value: { bbb: 123 },
    });
    expect(shallowCloneIfImmutable(obj)).not.toBe(obj);
    expect(shallowCloneIfImmutable(obj)).toEqual(obj);
  });

  it('should not clone', () => {
    const obj = {
      foo: {
        bar: 123,
      },
      bar: 456,
    };
    Object.defineProperty(obj, 'aaa', {
      configurable: true,
      writable: false,
      value: { bbb: 123 },
    });
    Object.defineProperty(obj, 'bbb', {
      configurable: false,
      writable: true,
      value: { ccc: 123 },
    });
    expect(shallowCloneIfImmutable(obj)).toBe(obj);
  });
});

describe('shouldBeIgnored', () => {
  it('ignoreSymbol = true', () => {
    expect(shouldBeIgnored({})).toBe(false);
    expect(shouldBeIgnored({ [Gettie.ignoreSymbol]: true })).toBe(true);
  });

  it('ignoreSymbol = key', () => {
    expect(shouldBeIgnored({ [Gettie.ignoreSymbol]: ['foo'] }, 'foo')).toBe(true);
    expect(shouldBeIgnored({ [Gettie.ignoreSymbol]: ['foo'] }, 'bar')).toBe(false);
  });

  it('key as symbol', () => {
    expect(shouldBeIgnored({}, Symbol('foo'))).toBe(true);
  });

  it('value as ignoreSymbol', () => {
    expect(shouldBeIgnored({ foo: { [Gettie.ignoreSymbol]: true } }, 'foo')).toBe(true);
  });
});
