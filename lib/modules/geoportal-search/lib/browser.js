module.exports = function(self, options) {
  self.pushAssets = function() {
    self.pushAsset('script', 'always', { when: 'always' });
    self.geop.push.browserCall('always', 'geop.searchSuggestions = ?', self.options.suggestions);
  };
};
