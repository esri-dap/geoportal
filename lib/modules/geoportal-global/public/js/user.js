geop.define('geoportal-global', {
  extend: 'geoportal-pieces',

  afterConstruct: function(self) {
    self.addClickHandlers();
  },

  beforeConstruct: function(self, options) {
    self.options = options;
  },

  construct: function(self, options) {

    self._id = self.options._id;

    self.manage = function() {
      var hasFields = _.find(self.options.schema, function(field) {
        return !field.contextual;
      });
      if ((!hasFields) && (!options.alwaysShowEditor)) {
        // No schema fields to edit, so skip all the way to version management for
        // shared global content like the header and footer rather than
        // displaying an empty modal
        return geop.versions.edit(self._id);
      }
      // Go directly to editing the one and only global piece
      return self.edit(self._id);
    };

    self.addClickHandlers = function() {
      geop.ui.link('geop-versions', 'global', function($button) {
        geop.versions.edit(self._id);
      });
    };

  }
});
