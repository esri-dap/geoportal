geop.define('geoportal-admin-bar', {

  afterConstruct: function(self) {
    self.enhance();
  },

  construct: function(self, options) {

    // When the specified admin bar item is clicked, call the specified function
    self.link = function(name, callback) {
      return $('body').on('click', '[data-geop-admin-bar-item="' + name + '"]', function() {
        callback();
        return false;
      });
    };

    // Implement the admin bar's toggle behavior and graceful close of dropdowns at
    // appropriate times.

    self.enhance = function() {
      var $bar = $('[data-geop-admin-bar]');
      var isHomepage = $('[data-geop-level="0"]').length;
      if ((options.openOnHomepageLoad && isHomepage) || options.openOnLoad) {
        $bar.css('overflow', 'visible');
        $bar.addClass('geop-active');
      } else {
        $bar.css('overflow', 'hidden');
      }
      var $dropdowns = $bar.find('[data-geop-dropdown]');

      // on transitionend, turn overflow on so we can see dropdowns!
      $bar.on('transitionend webkitTransitionEnd oTransitionEnd', function() {
        if ($bar.hasClass('geop-active')) {
          $bar.css('overflow', 'visible');
        }
      });

      // when we collapse the menu, turn all dropdowns off. Don't show overflow while transitioning
      $bar.find('[data-geop-admin-bar-logo]').on('click', function() {
        $bar.css('overflow', '');
        $bar.find('[data-geop-dropdown]').removeClass('geop-active');
      });

      // when the bar is clicked, make a note of it so we don't auto
      // collapse the menu from load
      $bar.on('click', function() {
        $bar.addClass('geop-admin-bar--clicked');
      });

      $bar.on('click', '[data-geop-dropdown-items]>li', function() {
        $dropdowns.removeClass('geop-active');
      });

      self.autoCollapse($bar);

      // when opening dropdowns, close other dropdowns
      $dropdowns.on('click', function() {
        $bar.find('[data-geop-dropdown]').not(this).removeClass('geop-active');
      });

    };

    self.collapse = function($bar) {
      if (!$bar.hasClass('geop-admin-bar--clicked')) {
        $bar.css('overflow', '');
        $bar.removeClass('geop-active');
      }
    };

    self.autoCollapse = function ($bar) {
      if (typeof options.closeDelay === 'number' && options.closeDelay > 0) {
        setTimeout(function () {
          self.collapse($bar);
        }, options.closeDelay);
      }
    };

    geop.adminBar = self;
  }
});
