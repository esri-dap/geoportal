geop.synth = moog({});

_.extend(apos, {

  modules: {},

  handlers: {},

  // EVENT HANDLING
  //
  // geop.emit(eventName, /* arg1, arg2, arg3... */)
  //
  // Emit an Geoportal event. All handlers that have been set
  // with geop.on for the same eventName will be invoked. Any additional
  // arguments are received by the handler functions as arguments.
  //
  // CURRENT EVENTS
  //
  // 'enhance' is triggered to request progressive enhancement
  // of form elements newly loaded into the DOM. It is most often
  // listened for in admin modals.
  //
  // 'ready' is triggered when the main content area of the page
  // has been refreshed.

  emit: function(eventName /* ,arg1, arg2, arg3... */) {
    var handlers = geop.handlers[eventName];
    if (!handlers) {
      return;
    }
    var args = Array.prototype.slice.call(arguments, 1);
    var i;
    for (i = 0; (i < handlers.length); i++) {
      handlers[i].apply(window, args);
    }
  },

  // Install an Geoportal event handler. The handler will be called
  // when geop.emit is invoked with the same eventName. The handler
  // will receive any additional arguments passed to geop.emit.

  on: function(eventName, fn) {
    geop.handlers[eventName] = (geop.handlers[eventName] || []).concat([ fn ]);
  },

  // Remove an Geoportal event handler. If fn is not supplied, all
  // handlers for the given eventName are removed.
  off: function(eventName, fn) {
    if (!fn) {
      delete geop.handlers[eventName];
      return;
    }
    geop.handlers[eventName] = _.filter(geop.handlers[eventName], function(_fn) {
      return fn !== _fn;
    });
  },

  // When geop.change('foo') is invoked, the following things happen:
  //
  // 1. geop.emit('change', 'foo') is invoked.
  //
  // 2. The main content area (the data-geop-refreshable div) is
  // refreshed via an AJAX request, without refreshing the entire page.
  //
  // This occurs without regard to the `what` parameter because there are
  // too many ways that the main content area can be influenced by any
  // change made via the admin bar. It's simplest to refresh the
  // entire content zone and still much faster than a page refresh.
  //
  // You can also pass a doc object as `what`, in which
  // case the `emit` call looks like:
  //
  // geop.emit('change', what.type, what)

  change: function(what) {
    if (typeof (what) === 'object') {
      geop.emit('change', what.type, what);
    } else {
      geop.emit('change', what);
    }
    geop.ui.globalBusy(true);
    $.get(window.location.href, { apos_refresh: geop.utils.generateId() }, function(data) {
      geop.ui.globalBusy(false);
      // Make sure we run scripts in the returned HTML
      $('[data-geop-refreshable]').html($.parseHTML(data, document, true));
    }).fail(function() {
      geop.ui.globalBusy(false);
    });
  },

  isDefined: geop.synth.isDefined,

  define: geop.synth.define,

  redefine: geop.synth.redefine,

  create: geop.synth.create,

  mirror: geop.synth.mirror,

  // The page is ready for the addition of event handlers and
  // progressive enhancement of controls.
  //
  // Either the entire page is new, or the main content div,
  // [data-geop-refreshable], has been refreshed.
  //
  // $el will be either $('body') or $('[data-geop-refreshable]'),
  // as appropriate.
  //
  // This is not invoked until after DOM Ready and "next tick."

  pageReady: function($el) {
    geop.emit("ready");
    geop.emit("enhance", $el);
  },

  // Wrapper that invokes pageReady after both DOM Ready and
  // "next tick" so that code in pushed javascript files has had
  // ample opportunity to run first. See pageReady

  pageReadyWhenCalm: function($el) {
    $(function() {
      setImmediate(function() {
        geop.pageReady($el);
      });
    });
  },

  // Angular-compatible. Send the csrftoken cookie as the X-CSRFToken header.
  // This works because if we're running via a script tag or iframe, we won't
  // be able to read the cookie.
  //
  // https://docs.angularjs.org/api/ng/service/$http#cross-site-request-forgery-xsrf-protection
  //
  // We use Angular's cookie name although CSRF is a more common spelling. -Tom

  csrf: function() {
    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
      var csrfToken;
      if ((options.type !== 'OPTIONS') && (!options.crossDomain)) {
        if (!geop.csrfCookieName) {
          csrfToken = 'csrf-fallback';
        } else {
          csrfToken = $.cookie(geop.csrfCookieName);
        }
        jqXHR.setRequestHeader('X-XSRF-TOKEN', csrfToken);
      }
    });
  },

  prefixAjax: function() {
    // If Geoportal has a global URL prefix, patch
    // jQuery's AJAX capabilities to prepend that prefix
    // to any non-absolute URL

    if (geop.prefix) {
      $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
        if (options.url) {
          if (!options.url.match(/^[a-zA-Z]+:/)) {
            options.url = geop.prefix + options.url;
          }
        }

      });
    }
  },

  // Create a singleton representing a server-side module and
  // register it in `geop.modules`. If it has an alias register
  // it directly on the `apos` object too.

  createModule: function(type, options, alias) {
    if (_.has(geop.modules, type)) {
      // Don't double-create singletons on geop.change(), leads to doubled click events etc.
      return;
    }
    var module = geop.create(type, options);
    geop.modules[type] = module;
    if (alias) {
      apos[alias] = module;
    }
  }

});

// So that it can be instantiated with options passed from the server

geop.define('geoportal-assets', {
  construct: function(self, options) {
    self.options = options;
    geop.assets = self;
  }
});
