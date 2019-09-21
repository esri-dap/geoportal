geop.define('geoportal-tags', {
  extend: 'geoportal-context',
  afterConstruct: function(self) {
    self.enableClickHandlers();
  },
  construct: function(self, options) {
    self.enableClickHandlers = function() {
      geop.adminBar.link('geoportal-tags', function() {
        self.manage();
      });
    };

    self.manage = function() {
      geop.create('geoportal-tags-manager-modal', options);
    };
  }
});
