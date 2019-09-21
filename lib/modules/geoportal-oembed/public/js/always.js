// The browser-side `geop.oembed` singleton. Provides the
// `geop.oembed.query` and `geop.oembed.queryAndPlay` methods.

geop.define('geoportal-oembed', {
  construct: function(self, options) {
    self.options = options;

    // Populate the specified div with the oembed result for the specified URL.
    // Adds the apos-oembed-busy class to $el during the interim.
    //
    // options.url must be set to the URL for the oembed query.
    //
    // If options.type is set, the type property of the oembed response must match,
    // or it is treated as invalid.
    //
    // On success the title and thumbnail URL oembed result properties are made
    // available as the `title` and `thumbnail` jQuery data properties of
    // $el.
    //
    // The callback is optional and is invoked when the video has been
    // displayed and sized. It receives (null, $el, result).

    self.queryAndPlay = function($el, options, callback) {
      $el.removeClass('apos-oembed-invalid');
      $el.addClass('apos-oembed-busy');
      if (!options.url) {
        return fail('undefined');
      }
      return self.query(options, function(err, result) {
        if (err || (options.type && (result.type !== options.type))) {
          return fail(err || 'inappropriate');
        }
        $el.removeClass('apos-oembed-busy');
        return self.play($el, result, callback);
      });
      function fail(err) {
        $el.removeClass('apos-oembed-busy');
        $el.addClass('apos-oembed-invalid');
        $el.data('title', undefined);
        $el.data('thumbnail', undefined);
        if (err !== 'undefined') {
          $el.html('Ⓧ');
        } else {
          $el.html('');
        }
        return callback && callback(err);
      }
    };

    // geop.oembed.query: a convenience wrapper for making oembed requests
    // through Apostrophe's built-in proxy. options.url must be set to the
    // URL for the oembed query.

    self.query = function(options, callback) {
      // A situation where we actually do want a cacheable GET request
      return $.getJSON(self.options.action + '/query', options, function(html) {
        return callback(null, html);
      }).fail(function(jqXHR) {
        return callback(jqXHR.status || 'error');
      });
    };

    // geop.oembed.play accepts a jQuery div and an oembed response
    // from geop.oembed.query. The div is repopulated with the oembed result.
    // The callback is optional and is invoked when the video has been
    // displayed and sized. It receives (null, $el, result).
    //
    // On success the title and thumbnail URL oembed result properties are made
    // available as the `title` and `thumbnail` jQuery data properties of
    // $el.
    //
    // Normally `geop.oembed.queryAndPlay` is the most convenient approach.

    self.play = function($el, result, callback) {
      var $e = $(result.html);
      $el.html('');
      $e.removeAttr('width');
      $e.removeAttr('height');
      $el.append($e);
      $el.data('title', result.title);
      $el.data('thumbnail', result.thumbnail_url);
      // wait for CSS width to be known
      $(function() {
        // If oembed results include width and height we can get the
        // video aspect ratio right
        if (result.width && result.height) {
          $e.height((result.height / result.width) * $e.width());
        } else {
          // No, so assume the oembed HTML code is responsive.
        }
        geop.emit('oembedReady', $el);
        return callback && callback(null, $el, result);
      });

    };

    geop.oembed = self;

  }
});
