import { isObjectOrArray } from './utils';

export default class ProxyManager {
  #proxies = {
    dataToProxy: new WeakMap(),
    proxyToData: new WeakMap(),
  };

  constructor() {
    this.reset();
  }

  reset() {
    this.#proxies = {
      dataToProxy: new WeakMap(),
      proxyToData: new WeakMap(),
    };
  }

  isProxy(data) {
    return !!this.#proxies.proxyToData.has(data);
  }

  getProxy(data) {
    if (this.isProxy(data)) {
      return data;
    }

    return this.#proxies.dataToProxy.get(data);
  }

  getData(proxy) {
    return this.#proxies.proxyToData.get(proxy) || proxy;
  }

  setProxy(data, proxy) {
    this.#proxies.dataToProxy.set(data, proxy);
    this.#proxies.proxyToData.set(proxy, data);
  }

  createProxy(data, config) {
    const proxy = this.getProxy(data);

    if (proxy) {
      data = proxy;
    }

    if (!this.isProxy(data) && isObjectOrArray(data)) {
      const proxy = new Proxy(data, config);
      this.setProxy(data, proxy);
      data = proxy;
    }

    return data;
  }
}
