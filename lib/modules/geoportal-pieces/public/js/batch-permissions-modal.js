// A modal for selecting permissions to be applied to a batch of pieces

geop.define('geoportal-pieces-batch-permissions-modal', {

  extend: 'geoportal-modal',

  source: 'batch-permissions-modal',

  verb: 'permissions',

  construct: function(self, options) {
    self.beforeShow = function(callback) {
      _.assign(options.body, geop.schemas.newInstance(options.schema));
      return geop.schemas.populate(self.$el, options.schema, options.body, callback);
    };

    self.saveContent = function(callback) {
      return geop.schemas.convert(self.$el, options.schema, options.body, {}, function(err) {
        if (!err) {
          self.ok = true;
        }
        return callback(err);
      });
    };

    self.afterHide = function() {
      return options.after(self.ok ? null : 'Canceled');
    };
  }
});
