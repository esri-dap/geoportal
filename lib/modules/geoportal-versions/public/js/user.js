// A singleton that provides a jQuery click handler to open the
// version editor when [data-geop-versions-page="id"] is clicked,
// and also an `edit` method to be invoked by
// [geoportal-pieces-editor-modal](https://docs.geoportalcms.org/geoportal/modules/geoportal-pieces/browser-geoportal-pieces-editor-modal).

geop.define('geoportal-versions', {

  extend: 'geoportal-context',

  beforeConstruct: function(self, options) {
    self.options = options;
  },

  afterConstruct: function(self) {
    self.addLinks();
  },

  construct: function(self) {
    self.addLinks = function() {
      geop.ui.link('geop-versions', 'page', function() {
        self.edit(geop.pages.page._id);
      });
      // pieces subclasses can be many and varied, so they add
      // their own links to trigger the versions editor.
    };

    self.edit = function(id, afterRevert) {
      if (!afterRevert) {
        afterRevert = function() {
          window.location.reload(true);
        };
      }
      geop.create('geoportal-versions-editor', {
        action: self.action,
        _id: id,
        afterRevert: afterRevert
      });
    };

    geop.versions = self;
  }
});
