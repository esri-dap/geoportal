var t = require('../test-lib/test.js');
var assert = require('assert');
var apos;

describe('Admin bar', function() {

  this.timeout(t.timeout);

  /// ///
  // EXISTENCE
  /// ///

  it('should allow a group reversing the current order', function(done) {
    apos = require('../index.js')({
      root: module,
      shortName: 'test',

      modules: {
        'geoportal-express': {
          secret: 'xxx',
          port: 7900,
          csrf: false
        },
        'geoportal-admin-bar': {
          addGroups: [
            {
              label: 'Media',
              items: [
                'geoportal-images',
                'geoportal-files'
              ]
            },
            {
              label: 'Content',
              items: [
                'geoportal-login-logout',
                'geoportal-files',
                'geoportal-images'
              ]
            }
          ]
        }
      },
      afterInit: function(callback) {
        assert(geop.modules['geoportal-admin-bar']);
        assert(geop.adminBar);
        assert(geop.adminBar.items.length === 8);
        assert(geop.adminBar.items[5].name === 'geoportal-login-logout');
        assert(geop.adminBar.items[6].name === 'geoportal-files');
        assert(geop.adminBar.items[7].name === 'geoportal-images');
        // In tests this will be the name of the test file,
        // so override that in order to get apostrophe to
        // listen normally and not try to run a task. -Tom
        geop.argv._ = [];
        return callback(null);
      },
      afterListen: function(err) {
        assert(!err);
        return t.destroy(apos, done);
      }
    });
  });

  it('should allow a group obeying the current order', function(done) {
    apos = require('../index.js')({
      root: module,
      shortName: 'test',

      modules: {
        'geoportal-express': {
          secret: 'xxx',
          port: 7900,
          csrf: false
        },
        'geoportal-admin-bar': {
          addGroups: [
            {
              label: 'Media',
              items: [
                'geoportal-images',
                'geoportal-files'
              ]
            },
            {
              label: 'Content',
              items: [
                'geoportal-files',
                'geoportal-images',
                'geoportal-login-logout'
              ]
            }
          ]
        }
      },
      afterInit: function(callback) {
        assert(geop.modules['geoportal-admin-bar']);
        assert(geop.adminBar);
        assert(geop.adminBar.items.length === 8);
        assert(geop.adminBar.items[5].name === 'geoportal-files');
        assert(geop.adminBar.items[6].name === 'geoportal-images');
        assert(geop.adminBar.items[7].name === 'geoportal-login-logout');
        // In tests this will be the name of the test file,
        // so override that in order to get apostrophe to
        // listen normally and not try to run a task. -Tom
        geop.argv._ = [];
        return callback(null);
      },
      afterListen: function(err) {
        assert(!err);
        return t.destroy(apos, done);
      }
    });
  });

});
