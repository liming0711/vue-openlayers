import HttpClientModule from 'axios-module';

class BaseModule {
  constructor () {
    this.$http = new HttpClientModule();
  }

  get (url, config = {}) {
    return this.$http.get(url, config);
  }

  post (url, data = undefined, config = {}) {
    return this.$http.post(url, data, config);
  }

  put (url, data = undefined, config = {}) {
    return this.$http.put(url, data, config);
  }

  delete (url, config = {}) {
    return this.$http.delete(url, config);
  }
}

export default BaseModule;
