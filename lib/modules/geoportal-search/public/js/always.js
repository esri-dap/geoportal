$(function() {
  $('body').on('click', '[data-apos-search-filter]', function() {
    $(this).closest('form').submit();
  });
  $('body').on('keyup', '[data-apos-search-field]', function (e) {
    if (e.keyCode === 13) {
      $(this).closest('form').submit();
      return false;
    }
  });
});

geop.on('notfound', function(info) {
  $(function() {
    var url = '/search';
    if (geop.searchSuggestions === false) {
      // Explicitly disabled
      return;
    }
    if (geop.searchSuggestions && geop.searchSuggestions.url) {
      url = geop.searchSuggestions.url;
    }
    $.get(url, { q: info.suggestedSearch }, function(html) {
      $('[data-apos-notfound-search-results]').html(html);
    });
  });
});
