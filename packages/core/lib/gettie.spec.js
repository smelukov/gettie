import Gettie from './gettie';

describe('gettie', () => {
  let originalObj = {
    foo: 123,
    bar: [123, { baz: [1, 2, 3], quux: 4 }],
  };

  it('should be wrapped/unwrapped', () => {
    const gettie = new Gettie(originalObj);
    let obj = gettie.get();

    expect(obj).not.toBe(originalObj);
    expect(gettie.coverage()).toMatchSnapshot();
    expect(gettie.unwrap()).toStrictEqual(originalObj);
  });

  describe('coverage', () => {
    it('just coverage', () => {
      const gettie = new Gettie();
      let obj = gettie.update(originalObj);

      obj.bar[1].quux;
      obj.bar[0];
      expect(gettie.coverage()).toMatchSnapshot();
    });

    it('nullish prop', () => {
      const gettie = new Gettie();
      let obj = gettie.update({ ...originalObj });

      obj.bar[1].quux;
      obj.bar[0];
      obj.bar = null;
      obj.not_defined;
      expect(gettie.coverage()).toMatchSnapshot();
    });
  });

  it('reset', () => {
    const gettie = new Gettie();
    let obj = gettie.update(originalObj);

    obj.bar[1].quux;
    obj.bar[0];
    gettie.reset();
    gettie.update(originalObj);
    expect(gettie.coverage()).toMatchSnapshot();
    obj.bar[1].quux;
    obj.bar[0];
    gettie.reset(originalObj);
    expect(gettie.coverage()).toMatchSnapshot();
  });

  describe('wrap fn', () => {
    it('with lock', () => {
      const gettie = new Gettie();
      const reducer = (state, action) => {
        return { ...state, ...action.payload };
      };
      const newReducer = gettie.wrapFn(reducer);
      const state = newReducer({ foo: 123, bar: 456 }, { payload: { baz: 789 } });
      state.baz;
      newReducer(state, { payload: { quux: 789 } });

      expect(gettie.coverage()).toMatchSnapshot();
    });

    it('without lock', () => {
      const gettie = new Gettie();
      const reducer = (state, action) => {
        return { ...state, ...action.payload };
      };
      const newReducer = gettie.wrapFn(reducer, false);
      const state = newReducer({ foo: 123, bar: 456 }, { payload: { baz: 789 } });
      state.baz;
      newReducer(state, { payload: { quux: 789 } });

      expect(gettie.coverage()).toMatchSnapshot();
    });
  });

  describe('ignoring', () => {
    it('object', () => {
      const gettie = new Gettie();
      let obj = gettie.update({
        foo: 123,
        bar: [123, { [Gettie.ignoreSymbol]: true, baz: [1, 2, 3], quux: 4 }],
      });

      obj.bar[1].quux;
      obj.bar[0];
      expect(gettie.coverage()).toMatchSnapshot();
    });

    it('prop', () => {
      const gettie = new Gettie();
      let obj = gettie.update({
        foo: 123,
        bar: [123, { [Gettie.ignoreSymbol]: ['quux'], baz: [1, 2, 3], quux: 4 }],
      });

      obj.bar[1].baz;
      obj.bar[1].quux;
      obj.bar[0];
      expect(gettie.coverage()).toMatchSnapshot();
    });

    it('symbols', () => {
      const symbol = Symbol('foo');
      const gettie = new Gettie();
      let obj = gettie.update({
        foo: 123,
        [symbol]: { foo: 123 },
      });

      obj.foo;
      obj[symbol].foo;
      expect(gettie.coverage()).toMatchSnapshot();
    });
  });
});
