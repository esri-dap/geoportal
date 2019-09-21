geop.define('geoportal-any-page-manager', {
  extend: 'geoportal-doc-type-manager',

  construct: function(self, options) {

    var superGetTool = self.getTool;
    self.getTool = function(name, options, callback) {
      if (name === 'manager-modal') {
        return geop.pages.chooserModal(options);
      }
      return superGetTool(name, options, callback);
    };

    var superGetToolType = self.getToolType;
    self.getToolType = function(name) {
      if (name === 'manager-modal') {
        return 'geoportal-pages-reorganize';
      }
      return superGetToolType(name);
    };
  }
});
