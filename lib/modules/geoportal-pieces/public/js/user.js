// The browser-side doc type manager for a type of piece. Provides jQuery event handlers
// for edit, rescue, create and version rollback based on data attributes that can
// appear anywhere, which is useful for contextual pieces.

geop.define('geoportal-pieces', {

  extend: 'geoportal-doc-type-manager',

  afterConstruct: function(self) {
    self.clickHandlers();
  },

  construct: function(self, options) {

    self.options = options;
    self.name = self.options.name;

    self.clickHandlers = function() {
      geop.adminBar.link(self.__meta.name, function() {
        self.manage();
      });
      // The rest of these are not part of the admin bar, follow our own convention
      geop.ui.link('geop-manage', self.name, function($button, _id) {
        self.manage();
      });
      geop.ui.link('geop-edit', self.name, function($button, _id) {
        var hint = $button.attr('data-geop-edit-hint');
        self.edit(_id, { hint: hint });
      });
      geop.ui.link('geop-rescue', self.name, function($button, _id) {
        self.rescue(_id);
      });
      geop.ui.link('geop-create', self.name, function($button) {
        self.create();
      });
      geop.ui.link('geop-publish', self.name, function($button, id) {
        var piece = { _id: id };
        self.api('publish', piece, function(data) {
          if (data.status !== 'ok') {
            return geop.notify('An error occurred while publishing the page: ' + data.status, { type: 'error' });
          }
          // Go to the new page
          window.location.reload(true);
        });
      });
      geop.ui.link('geop-versions', self.name, function($button, id) {
        geop.versions.edit(id, function() {
          geop.change(self.name);
        });
      });
      geop.ui.link('geop-trash', self.name, function($button, id) {
        if (!confirm("Are you sure you want to trash this " + self.options.label + "?")) {
          return;
        }

        var piece = {
          _id: id
        };

        geop.ui.globalBusy(true);

        return self.api('trash', piece, function(result) {
          geop.ui.globalBusy(false);
          if (result.status !== 'ok') {
            geop.notify('An error occurred. Please try again.', { type: 'error', dismiss: true });
            return;
          }
          window.location.href = geop.pages.page._url;
        }, function() {
          geop.ui.globalBusy(false);
          geop.notify('An error occurred. Please try again.', { type: 'error', dismiss: true });

        });
      });
    };

    self.manage = function() {
      return self.getTool('manager-modal');
    };

    // `options` object is merged with the options passed to the editor modal,
    // in particular you can pass a `hint` to be displayed
    // at the top of the modal to provide context for why the edit operation
    // was undertaken

    self.edit = function(_id, options) {
      return self.getTool('editor-modal', _.merge({}, options || {}, { _id: _id }));
    };

    // `options` object is merged with the options passed to the editor modal,
    // in particular you can pass a `hint` to be displayed
    // at the top of the modal to provide context for why the edit operation
    // was undertaken
    self.create = function(options) {
      return self.getTool('editor-modal', _.merge({}, options || {}, { create: true }));
    };

    self.rescue = function(_id) {
      if (self.rescuing) {
        return;
      }
      self.rescuing = true;
      geop.ui.globalBusy(true);
      self.api('rescue', { _id: _id }, function(result) {
        self.rescuing = false;
        geop.ui.globalBusy(false);
        if (result.status !== 'ok') {
          geop.notify('An error occurred. Please try again.', { type: 'error', dismiss: true });
          return;
        } else {
          geop.notify('That item has been rescued from the trash.', { type: 'success', dismiss: 3 });
        }
        geop.change(self.name);
      }, function() {
        self.rescuing = false;
        geop.ui.globalBusy(false);
        geop.notify('An error occurred. Please try again', { type: 'error', dismiss: true });

      });
    };

    self.launchBatchPermissionsModal = function(data, callback) {
      return geop.create('geoportal-pieces-batch-permissions-modal',
        _.assign({}, self.options, {
          schema: self.options.batchPermissionsSchema,
          manager: self,
          body: data,
          after: callback
        })
      );
    };

  }
});
