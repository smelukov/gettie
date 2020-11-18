import { shouldBeIgnored } from './utils';

export default function extractBranches(data) {
  const branches = [];
  const objects = new WeakSet();

  function handleArray(array, path) {
    for (let i = 0; i < array.length; i++) {
      if (shouldBeIgnored(array, i)) {
        continue;
      }

      path.push(i);
      branches.push([...path]);
      handleItem(array[i], path);
      path.pop();
    }

    return array;
  }

  function handleObject(obj, path) {
    for (const name in obj) {
      if (shouldBeIgnored(obj, name)) {
        continue;
      }

      path.push(name);
      branches.push([...path]);
      handleItem(obj[name], path);
      path.pop();
    }

    return obj;
  }

  function handleItem(data, path) {
    if (data) {
      if (data.toJSON) {
        data = data.toJSON();
      }

      if (objects.has(data) || shouldBeIgnored(data)) {
        return data;
      }

      if (Array.isArray(data)) {
        objects.add(data);
        data = handleArray(data, path);
      } else if (data.constructor === Object) {
        objects.add(data);
        data = handleObject(data, path);
      }
    }

    return data;
  }

  handleItem(data, []);

  return branches;
}
