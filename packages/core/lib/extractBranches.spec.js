import extractBranches from './extractBranches';

describe('extract branches', () => {
  const obj = {
    a: 123,
    b: {
      [Symbol('foo')]: () => {},
      c: {
        d: 123,
      },
    },
    c: [1, { foo: 2 }, [3, 4]],
  };

  const objWithRecursion = {
    a: 123,
    b: {},
    c: [0, {}],
  };

  objWithRecursion.b.c = objWithRecursion;
  objWithRecursion.c[1] = objWithRecursion;

  it('object', () => {
    const branches = extractBranches(obj);
    expect(branches).toMatchSnapshot();
  });

  it('array', () => {
    const branches = extractBranches([obj]);
    expect(branches).toMatchSnapshot();
  });

  it('recursive', () => {
    const branches = extractBranches(objWithRecursion);
    expect(branches).toMatchSnapshot();
  });
});
