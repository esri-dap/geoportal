geop.define('geoportal-tags-manager-modal', {
  extend: 'geoportal-modal',
  source: 'manager',
  construct: function(self, options) {
    self.beforeShow = function(callback) {
      self.$results = self.$el.find('[data-geop-tags-view]');
      self.$search = self.$el.find('[data-geop-tag-add-field]');
      self.addClickHandlers();
      self.$search.on('keyup', function() {
        self.refresh();
      });
      return self.refresh(callback);
    };

    self.addClickHandlers = function() {
      self.link('geop-tag-add', self.add);
      self.link('geop-tag-rename', self.rename);
      self.link('geop-tag-edit', self.edit);
      self.link('geop-tag-delete', self.delete);
    };

    self.refresh = function(callback) {
      // TODO implement options
      var listOptions = {};
      if (self.$search.val()) {
        listOptions.contains = self.$search.val();
      }
      if (!listOptions.contains || !listOptions.contains.length) {
        listOptions.all = true;
      }
      self.beforeRefresh(listOptions);
      return self.api('listTags', listOptions, function(response) {
        if (response.status !== 'ok') {
          geop.notify('An error occurred. Please try again.', { type: 'error', dismiss: true });
          return;
        }
        self.$results.html(response.data.results);
        geop.emit('enhance', self.$results);
        self.resizeContentHeight();
        self.afterRefresh();
        if (callback) {
          return callback();
        }
      });
    };

    self.add = function($el) {
      var value = $el.siblings('[data-geop-tag-add-field]').val();
      if (value) {
        return self.api('addTag', { tag: value }, function(response) {
          if (response.status !== 'ok') {
            geop.notify('An error occurred. Please try again.', { type: 'error', dismiss: true });
            return;
          }
          // Reset value, since we added the tag
          self.$search.val('');
          self.refresh();
        });
      } else {
        geop.notify('Please, fill in the input before adding a tag.', { type: 'error', dismiss: true });
      }
    };

    self.edit = function($el, value) {
      self.$el.find('[data-geop-tag]')
        .removeClass('geop-active')
        .find('input')
        .attr('disabled', true);
      $el.parents('[data-geop-tag]')
        .addClass('geop-active')
        .find('input')
        .attr('disabled', false)
        .focus();
    };

    self.rename = function($el, value) {
      var $tag = $el.parents('[data-geop-tag]');
      var tag = $tag.data('geop-tag');
      var newTag = $tag.find('input').val();
      if (tag === newTag) {
        return;
      }
      return self.api('renameTag', { tag: tag, newTag: newTag }, function(response) {
        if (response.status !== 'ok') {
          geop.notify('An error occurred. Please try again.', { type: 'error', dismiss: true });
          return;
        }
        self.refresh();
      });
    };

    self.delete = function($el, value) {
      if (!confirm('Are you sure you want to delete this tag?')) {
        return;
      }
      return self.api('deleteTag', { tag: value }, function(response) {
        if (response.status !== 'ok') {
          geop.notify('An error occurred. Please try again.', { type: 'error', dismiss: true });
          return;
        }
        self.refresh();
      });
    };

    self.beforeRefresh = function(options) {
      // Overridable hook
    };

    self.afterRefresh = function() {
      // Overridable hook
    };
  }
});
