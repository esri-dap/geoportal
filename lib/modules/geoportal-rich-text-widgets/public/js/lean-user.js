// If we're logged in, rich text has a "player"
// to implement the "click to start editing" behavior.
// Provide a "lean" player that just wraps that play method,
// which would not otherwise be invoked in the lean world.
// This file is pushed only for the "user" scene, so there
// is no overhead in the truly lean logged-out world.

(function() {
  geop.utils.widgetPlayers['geoportal-rich-text'] = function(el, data, options) {
    var richText = geop.modules['geoportal-rich-text-widgets'];
    return richText.play(window.$(el), data, options);
  };
})();
