// Cursor for fetching docs of this specific type. The `afterConstruct`
// method locks the results down to this type by calling the
// `self.type` filter for us. Subclasses frequently add new filters.
//
// We subclass `geoportal-pages-cursor` so that cursors for page types
// are able to use `.children()`, `.ancestors()`, etc.

module.exports = {
  extend: 'geoportal-pages-cursor',
  afterConstruct: function(self) {
    self.type(self.options.module.name);
  }
};
