var _ = require('@sailshq/lodash');

module.exports = {

  extend: 'geoportal-pieces-cursor',

  construct: function(self, options) {

    self.addFilter('minSize', {
      finalize: function() {
        var minSize = self.get('minSize');
        if (!minSize) {
          return;
        }
        var $nin = _.filter(_.keys(self.geop.attachments.sized), function(key) {
          return self.geop.attachments.sized[key];
        });
        var criteria = {
          $or: [
            {
              'attachment.extension': { $nin: $nin }
            },
            {
              'attachment.width': { $gte: minSize[0] },
              'attachment.height': { $gte: minSize[1] }
            }
          ]
        };
        self.and(criteria);
      },
      safeFor: 'public',
      launder: function(a) {
        if (!Array.isArray(a)) {
          return undefined;
        }
        if (a.length !== 2) {
          return undefined;
        }
        return [ self.geop.launder.integer(a[0]), self.geop.launder.integer(a[1]) ];
      }
    });

  }

};
