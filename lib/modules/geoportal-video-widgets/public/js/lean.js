geop.utils.widgetPlayers['geoportal-video'] = function(el, data, options) {

  queryAndPlay(
    el.querySelector('[data-apos-video-player]'),
    geop.utils.assign(data.video, {
      neverOpenGraph: 1
    })
  );

  function queryAndPlay(el, options) {
    geop.utils.removeClass(el, 'apos-oembed-invalid');
    geop.utils.addClass(el, 'apos-oembed-busy');
    if (!options.url) {
      return fail('undefined');
    }
    return query(options, function(err, result) {
      if (err || (options.type && (result.type !== options.type))) {
        return fail(err || 'inappropriate');
      }
      geop.utils.removeClass(el, 'apos-oembed-busy');
      return play(el, result);
    });
  }

  function query(options, callback) {
    return geop.utils.get('/modules/apostrophe-oembed/query', options, callback);
  }

  function play(el, result) {
    var shaker = document.createElement('div');
    shaker.innerHTML = result.html;
    var inner = shaker.firstChild;
    el.innerHTML = '';
    if (!inner) {
      return;
    }
    inner.removeAttribute('width');
    inner.removeAttribute('height');
    el.append(inner);
    // wait for CSS width to be known
    geop.utils.onReady(function() {
      // If oembed results include width and height we can get the
      // video aspect ratio right
      var parent = geop.utils.closest(inner, '[data-apos-video-player]');

      if (result.width && result.height) {
        inner.style.height = ((result.height / result.width) * parent.offsetWidth) + 'px';
        inner.style.width = parent.offsetWidth + 'px';
      } else {
        // No, so assume the oembed HTML code is responsive.
      }
    });
  }

  function fail(err) {
    geop.utils.removeClass(el, 'apos-oembed-busy');
    geop.utils.addClass(el, 'apos-oembed-invalid');
    if (err !== 'undefined') {
      el.innerHTML = 'Ⓧ';
    } else {
      el.innerHTML = '';
    }
  }

};
