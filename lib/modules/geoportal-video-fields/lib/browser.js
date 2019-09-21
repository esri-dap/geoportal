var _ = require('@sailshq/lodash');

module.exports = function(self, options) {
  self.pushAssets = function() {
    self.pushAsset('script', 'user', { when: 'user' });
    self.pushAsset('stylesheet', 'user', { when: 'user' });
  };

  self.pushCreateSingleton = function() {
    var options = {};
    _.defaults(options, { browser: {} });
    _.extend(options.browser, {
      name: self.name,
      action: self.action,
      oembedType: self.options.oembedType
    });
    self.geop.push.browserMirrorCall('user', self);
    self.geop.push.browserCall('user', 'geop.create(?, ?)', self.__meta.name, options.browser);
  };

};
