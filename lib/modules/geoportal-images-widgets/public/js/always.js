// example of a widget manager with a play method.
// You don't need this file at all if you
// don't need a player.

geop.define('geoportal-images-widgets', {
  extend: 'geoportal-pieces-widgets',
  construct: function(self, options) {
    self.play = function($widget, data, options) {
      $widget.projector(options);
    };
  }
});
