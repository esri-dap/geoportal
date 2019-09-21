// Pushes utility methods to the browser as the `geop.utils` singleton. This module
// is separate from [geoportal-utils](https://docs.geoportalcms.org/geoportal/modules/geoportal-utils) because that
// module is initialized very early, before it is possible to push assets to the browser.

module.exports = {
  construct: function(self, options) {
    self.pushAsset('script', 'lean', { when: 'lean' });
    self.pushAsset('script', 'always');
    // Extend the lean geop.utils object with the properties of the
    // legacy moog one, so that everybody sees what they expect to see
    self.geop.push.browserCall('always', 'geop.utils.assign(geop.utils, geop.create("geoportal-browser-utils"))');
  }
};
