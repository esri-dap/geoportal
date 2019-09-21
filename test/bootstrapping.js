var t = require('../test-lib/test.js');
var assert = require('assert');
var _ = require('@sailshq/lodash');

describe('Geoportal', function() {

  this.timeout(t.timeout);

  it('should exist', function(done) {
    var apos = require('../index.js');
    assert(apos);
    return t.destroy(apos, done);
  });

  // BOOTSTRAP FUNCTIONS ------------------------------------------- //

  it('should merge the options and local.js correctly', function(done) {
    var apos = require('../index.js')({
      root: module,
      shortName: 'test',
      overrideTest: 'test', // overriden by data/local.js

      __testDefaults: {
        modules: {}
      },
      afterInit: function(callback) {
        assert(geop.options.overrideTest === 'foo');
        return t.destroy(apos, done);
      }
    });
  });

  it('should accept a `__localPath` option and invoke local.js as a function if it is provided as one', function(done) {
    var apos = require('../index.js')({
      root: module,
      shortName: 'test',
      overrideTest: 'test', // overriden by data/local_fn.js

      __localPath: '/data/local_fn.js',
      __testDefaults: {
        modules: {}
      },
      afterInit: function(callback) {
        assert(geop.options.overrideTest === 'foo');
        return t.destroy(apos, done);
      }
    });
  });

  it('should invoke local.js as a function with the apos and config object', function(done) {
    var apos = require('../index.js')({
      root: module,
      shortName: 'test',
      overrideTest: 'test', // concated in local_fn_b.js

      __localPath: '/data/local_fn_b.js',
      __testDefaults: {
        modules: {}
      },
      afterInit: function(callback) {
        assert(geop.options.overrideTest === 'test-foo');
        return t.destroy(apos, done);
      }
    });
  });

  it('should accept a `__testDeafults` option and load the test modules correctly', function(done) {
    var apos = require('../index.js')({
      root: module,
      shortName: 'test',

      __testDefaults: {
        modules: {
          'geoportal-test-module': {}
        }
      },
      afterInit: function(callback) {
        assert(geop.modules['geoportal-test-module']);
        return t.destroy(apos, done);
      }
    });
  });

  it('should create the modules and invoke the construct function correctly', function(done) {
    var apos = require('../index.js')({
      root: module,
      shortName: 'test',
      __testDefaults: {
        modules: {
          'geoportal-test-module': {}
        }
      },
      afterInit: function(callback) {
        assert(geop.test && geop.test.color === 'red');
        return t.destroy(apos, done);
      }
    });
  });

  it('should load the default modules and implicitly subclass the base module correctly', function(done) {
    var defaultModules = require('../defaults.js').modules;

    var apos = require('../index.js')({
      root: module,
      shortName: 'test',

      afterInit: function(callback) {
        // color = blue is inherited from our implicit subclass of the base module
        assert(geop.assets && geop.assets.color === 'blue');
        // make sure that our modules match what is specifed in defaults.js
        assert(_.difference(_.keys(defaultModules), _.keys(geop.modules)).length === 0);
        return t.destroy(apos, done);
      }
    });
  });
});
