// A modal for importing pieces

geop.define('geoportal-jobs-modal', {

  extend: 'geoportal-modal',

  source: 'modal',

  construct: function(self, options) {
    self.canceling = false;

    self.beforeShow = function(callback) {
      self._id = options.body._id;
      self.$el.find('[data-geop-job-done]').hide();
      self.enableJobCancel();
      self.startProgress();
      return setImmediate(callback);
    };

    self.startProgress = function() {
      self.progressInterval = setInterval(self.updateProgress, 1000);
      self.updateProgress();
    };

    self.updateProgress = function() {
      return self.api('progress', { _id: self._id }, function(data) {
        if (data.status === 'ok') {
          self.$el.find('[data-geop-job-progress-container]').html(data.html);
          if (data.job.ended) {
            self.$el.find('[data-geop-job-cancel],[data-geop-job-stop]').hide();
            self.$el.find('[data-geop-job-done]').show();
            clearInterval(self.progressInterval);
            self.progressInterval = null;
            if (data.job.status === 'completed') {
              self.results = data.job.results;
            }
          }
        }
      });
    };

    self.afterHide = function() {
      if (self.progressInterval) {
        clearInterval(self.progressInterval);
        self.progressInterval = null;
      }
      if (self.options.change) {
        geop.change(self.options.change);
      }
      if (self.results !== undefined) {
        if (self.options.success) {
          self.options.success(self.results);
        }
      }
    };

    self.beforeCancel = function(callback) {
      if (self.progressInterval) {
        return callback('running');
      }
      return callback(null);
    };

    self.halt = function() {
      if (!self.progressInterval) {
        return;
      }
      geop.ui.globalBusy(true);
      self.canceling = true;
      return self.api('cancel', { _id: self._id }, function(data) {
        if (data.status !== 'ok') {
          return fail();
        }
        geop.ui.globalBusy(false);
      }, function(err) {
        return fail(err);
      });
      function fail(err) {
        geop.utils.error(err);
        geop.ui.globalBusy(false);
        geop.notify('An error occurred canceling the operation. Please try again.', { type: 'error' });
      }
    };

    self.enableJobCancel = function() {
      self.link('geop-job-cancel', function() {
        self.halt();
      });
    };

  }
});
