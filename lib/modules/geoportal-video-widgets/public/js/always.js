geop.define('geoportal-video-widgets', {
  extend: 'geoportal-widgets',
  construct: function(self, options) {
    self.play = function($widget, data, options) {
      var request = _.assign({}, data.video, { neverOpenGraph: 1 });
      return geop.oembed.queryAndPlay($widget.find('[data-geop-video-player]'), request);
    };
  }
});
