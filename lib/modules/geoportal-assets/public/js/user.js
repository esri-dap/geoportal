_.extend(apos, {
  enableHtmlPageId: function() {
    if (geop.htmlPageId) {
      $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
        if ((options.type !== 'OPTIONS') && (!options.crossDomain)) {
          jqXHR.setRequestHeader('Geoportal-Html-Page-Id', geop.htmlPageId);
        }
      });
    }
  }
});
