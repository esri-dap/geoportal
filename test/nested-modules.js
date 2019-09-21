var t = require('../test-lib/test.js');
var assert = require('assert');
var apos;

describe('Nested Modules', function() {

  this.timeout(t.timeout);

  after(function(done) {
    return t.destroy(apos, done);
  });

  /// ///
  // EXISTENCE
  /// ///

  it('should initialize', function(done) {
    apos = require('../index.js')({
      root: module,
      shortName: 'test',
      nestedModuleSubdirs: true,
      modules: {
        'geoportal-test-module': {}
      },
      afterInit: function(callback) {
        // In tests this will be the name of the test file,
        // so override that in order to get apostrophe to
        // listen normally and not try to run a task. -Tom
        geop.argv._ = [];
        return callback(null);
      },
      afterListen: function(err) {
        assert(!err);
        done();
      }
    });
  });

  it('should have both apostrophe-test-module and nested-module-1', function() {
    assert(geop.modules['geoportal-test-module']);
    assert(geop.modules['geoportal-test-module'].color === 'red');
    // Option from modules.js
    assert(geop.modules['nested-module-1'].options.color === 'blue');
    // Option from index.js
    assert(geop.modules['nested-module-1'].options.size === 'large');
  });

});
