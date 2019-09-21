// Provides the `geoportal-video` widget, which displays videos, powered
// by [geoportal-video-field](https://docs.geoportalcms.org/geoportal/modules/geoportal-video-fields) and
// [geoportal-oembed](https://docs.geoportalcms.org/geoportal/modules/geoportal-oembed). The video
// widget accepts the URL of a video on any website that supports the
// [oembed](http://oembed.com/) standard, including vimeo, YouTube, etc.
// In some cases the results are refined by oembetter filters configured
// by the `geoportal-oembed` module. It is possible to configure new filters
// for that module to handle video sites that don't natively support oembed.
//
// Videos are not actually hosted or stored by Geoportal.
//
// ## Options
//
// ### player: true
//
// If you have set `lean: true` for the `geoportal-assets` module,
// the standard oembed-based video player does not get pushed to the
// browser, as it is part of the legacy jQuery-based frontend.
//
// However, you may opt in to a similar player that uses only a
// few lines of lean JavaScript by setting the `player` option
// of this module to `true`. You may of course skip this and
// write your own.

module.exports = {
  extend: 'geoportal-widgets',
  label: 'Video',
  beforeConstruct: function(self, options) {
    options.addFields = [
      {
        type: 'video',
        name: 'video',
        label: 'Video URL',
        htmlHelp: 'This supports Vimeo, YouTube, and many other services listed <a href="https://geoportalcms.org/video-options" target="_blank">in the widget documentation</a>.',
        required: true
      }
    ].concat(options.addFields || []);
  },
  construct: function(self, options) {
    if (self.geop.assets.options.lean) {
      if (self.options.player) {
        self.pushAsset('script', 'lean', { when: 'lean' });
      }
    } else {
      self.pushAsset('script', 'always', { when: 'always' });
    }
  }
};
