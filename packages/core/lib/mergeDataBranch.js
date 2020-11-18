import { shouldBeIgnored, hasOwnProperty, isObjectOrArray } from './utils';

export default function mergeDataBranch(source, dest, path) {
  let sourceCursor = source;
  let destCursor = dest;

  // don't merge branch with ignoring part
  for (const part of path) {
    if (sourceCursor == null) {
      break;
    }

    if (shouldBeIgnored(sourceCursor, part)) {
      return dest;
    }

    sourceCursor = sourceCursor[part];
  }

  sourceCursor = source;

  for (const part of path) {
    if (sourceCursor == null) {
      return dest;
    }

    if (hasOwnProperty(destCursor, part)) {
      sourceCursor = sourceCursor[part];
      destCursor = destCursor[part];
      continue;
    }

    let nextData = sourceCursor[part];

    if (isObjectOrArray(nextData)) {
      if (nextData.constructor === Object) {
        nextData = {};
      } else {
        nextData = [];
      }
    }

    destCursor[part] = nextData;
    sourceCursor = sourceCursor[part];
    destCursor = destCursor[part];
  }

  return dest;
}
