// This module attaches an instance of the [launder](https://npmjs.org/package/launder)
// npm module as `geop.launder`. The `geop.launder` object is then used throughout
// Apostrophe to sanitize user input.

module.exports = {
  construct: function(self, options) {
    self.geop.launder = require('launder')(options);
  }
};
