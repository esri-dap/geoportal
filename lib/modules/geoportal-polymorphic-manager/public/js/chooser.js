geop.define('geoportal-polymorphic-manager-chooser', {
  extend: 'geoportal-doc-type-manager-chooser',
  autocomplete: false,
  construct: function(self, options) {
    self.launchBrowser = function() {
      return self.convertInlineRelationships(function(err) {
        if (err) {
          geop.notify('Please address errors first.', { type: 'error' });
          return;
        }
        return geop.create('geoportal-polymorphic-manager-manager-modal', {
          chooser: self,
          action: self.action,
          body: {
            limit: self.limit,
            field: self.field
          },
          transition: 'slide'
        });
      });
    };
  }
});
