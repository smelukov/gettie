import extractBranches from './extractBranches';
import mergeDataBranch from './mergeDataBranch';
import Gettie from './gettie';

describe('merge branches', () => {
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

  function createTest(source, dest) {
    return () => {
      const branches = extractBranches(source);
      for (const branch of branches) {
        mergeDataBranch(source, dest, branch);
        expect(dest).toMatchSnapshot();
      }

      expect(branches).toEqual(extractBranches(dest));
    };
  }

  it('object', createTest(obj, {}));

  it('array', createTest([obj], []));

  it('recursive', createTest(objWithRecursion, {}));

  it(
    'ignoring',
    createTest(
      {
        ...obj,
        ...{
          foo: {
            bar: {
              [Gettie.ignoreSymbol]: true,
              baz: 123,
            },
          },
        },
      },
      {}
    )
  );

  it('path with ignoring', () => {
    const source = {
      foo: { bar: { [Gettie.ignoreSymbol]: true, baz: 123 } },
    };
    const dest = {};

    mergeDataBranch(source, dest, ['foo', 'bar', 'baz']);
    expect(dest).toMatchSnapshot();
  });

  it('path with nullish part', () => {
    const source = {
      foo: { bar: null },
    };
    const dest = {};

    mergeDataBranch(source, dest, ['foo', 'bar', 'baz']);
    expect(dest).toMatchSnapshot();
  });
});
