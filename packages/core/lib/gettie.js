import mergeDataBranch from './mergeDataBranch';
import ProxyManager from './proxyManager';
import extractBranches from './extractBranches';
import { shouldBeIgnored, isObjectOrArray, shallowCloneIfImmutable } from './utils';

export default class Gettie {
  static ignoreSymbol = Symbol('gettie-ignore');

  #proxyManager = new ProxyManager();
  #locked = false;
  #usedBranches = new Set();
  #usedBranchesCache = new Set();
  #lastData = null;

  constructor(data) {
    this.reset(data);
  }

  wrapFn(fn, lock = true) {
    return (...args) => {
      if (lock) {
        this.lock();
      }
      let data = fn(...args);
      if (lock) {
        this.unlock();
      }
      data = this.update(data);
      return data;
    };
  }

  update(data, reset = false) {
    if (reset) {
      this.reset();
    }

    this.#lastData = data;
    this.lock();
    const proxy = this.#createProxy(data, []);
    this.unlock();

    return proxy;
  }

  get() {
    return this.#proxyManager.getProxy(this.#lastData);
  }

  unwrap() {
    return this.#proxyManager.getData(this.#lastData);
  }

  reset(data) {
    this.#proxyManager.reset();
    this.#locked = false;
    this.#usedBranches = new Set();
    this.#usedBranchesCache = new Set();
    this.#lastData = null;

    if (data != null) {
      this.update(data);
    }
  }

  lock() {
    this.#locked = true;
  }

  unlock() {
    this.#locked = false;
  }

  locked() {
    return this.#locked;
  }

  coverage() {
    this.lock();
    const branches = extractBranches(this.#lastData);
    const unusedBranches = [];
    const unusedData = this.#lastData.constructor === Object ? {} : [];
    const usedData = this.#lastData.constructor === Object ? {} : [];

    for (const branch of branches) {
      const branchString = branch.join('/');

      if (this.#usedBranchesCache.has(branchString)) {
        mergeDataBranch(this.#lastData, usedData, branch);
      } else {
        unusedBranches.push(branch);
        mergeDataBranch(this.#lastData, unusedData, branch);
      }
    }

    const coverage = {
      branches: {
        all: branches,
        used: [...this.#usedBranches],
        unused: unusedBranches,
      },
      data: {
        all: this.#lastData,
        used: usedData,
        unused: unusedData,
      },
    };
    this.unlock();

    return coverage;
  }

  #canBeProxified(data) {
    return data != null && isObjectOrArray(data) && !shouldBeIgnored(data);
  }

  #createProxy(data, path) {
    if (data && data.toJSON) {
      data = data.toJSON();
    }

    if (!this.#canBeProxified(data)) {
      return data;
    }

    const proxy = this.#proxyManager.getProxy(data);

    if (proxy) {
      return proxy;
    }

    return this.#proxyManager.createProxy(
      shallowCloneIfImmutable(data),
      this.#createProxyConfig(path)
    );
  }

  #createProxyConfig(path) {
    const pathCopy = [...path];
    return {
      get: (target, name) => {
        if (shouldBeIgnored(target, name)) {
          return target[name];
        }

        const currentPath = [...pathCopy, name];

        if (!this.locked()) {
          this.#use(currentPath);
        }

        if (target[name] == null || this.locked()) {
          return target[name];
        }

        return this.#createProxy(target[name], currentPath);
      },
    };
  }

  #use(path) {
    const branchString = path.join('/');

    if (this.#usedBranchesCache.has(branchString)) {
      return;
    }

    this.#usedBranchesCache.add(branchString);
    this.#usedBranches.add([...path]);

    path.reduce((all, current) => {
      all.push(current);
      this.#use(all);
      return all;
    }, []);
  }
}
