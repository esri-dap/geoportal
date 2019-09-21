module.exports = function(self, options) {

  self.pushAsset('script', 'user', { when: 'user' });
  self.pushAsset('script', 'editor', { when: 'user' });

  self.pushAsset('stylesheet', 'user', { when: 'user' });

  var browserOptions = {
    action: self.action,
    messages: {
      tryAgain: self.geop.i18n.__('Server error, please try again.')
    }
  };

  self.geop.push.browserCall('user', 'geop.create("geoportal-versions", ?)', browserOptions);

};
