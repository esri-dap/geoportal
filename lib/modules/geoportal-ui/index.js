// Provides the [geop.ui](browser-geoportal-ui) singleton on the browser side, which
// implements various general purpose UI features for Geoportal sites, and also
// the [geoportal-context](browser-geoportal-context) base class on the browser side,
// which is the base class of modals and of other types that benefit from being
// able to make API calls conveniently via `self.action` and link click handlers based on
// `self.$el`.

var _ = require('@sailshq/lodash');

module.exports = {
  userTimeFormat: 'h:mma',
  construct: function(self, options) {
    self.pushAsset('script', 'ui', { when: 'always' });
    self.pushAsset('script', 'context', { when: 'always' });
    self.pushAsset('stylesheet', 'always', { when: 'always' });
    self.pushAsset('stylesheet', 'vendor/font-awesome/font-awesome', { when: 'always' });
    // TODO figure out issue with scene, when: 'user' doesn't work
    self.pushAsset('stylesheet', 'user', { when: 'user' });
    self.geop.push.browserCall('always', 'geop.create("geoportal-ui", ?)',
      _.pick(self.options, 'userTimeFormat')
    );
    self.geop.templates.prepend('contextMenu', function (req) {
      return self.partial('components/tooltip.html', {});
    });
  }
};
