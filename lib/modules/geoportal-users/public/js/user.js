geop.define('geoportal-users', {
  extend: 'geoportal-pieces',

  construct: function(self, options) {
    var superClickHandlers = self.clickHandlers;
    self.clickHandlers = function() {
      superClickHandlers();
      $('body').on('click', '[data-geop-logout]', function() {
        document.location.href = geop.prefix + '/logout';
      });
    };
  }
});
