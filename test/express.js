var t = require('../test-lib/test.js');
var assert = require('assert');
var _ = require('@sailshq/lodash');
var apos;

describe('Express', function() {

  this.timeout(t.timeout);

  it('express should exist on the apos object', function(done) {
    apos = require('../index.js')({
      root: module,
      shortName: 'test',
      modules: {
        'geoportal-express': {
          secret: 'xxx',
          port: 7900
        },
        'express-test': {},
        'templates-test': {
          ignoreNoCodeWarning: true
        },
        'templates-subclass-test': {
          ignoreNoCodeWarning: true
        }
      },
      afterInit: function(callback) {
        assert(geop.express);
        // In tests this will be the name of the test file,
        // so override that in order to get geoportal to
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

  it('app should exist on the apos object', function() {
    assert(geop.app);
  });

  it('baseApp should exist on the apos object', function() {
    assert(geop.baseApp);
  });

  it('app and baseApp should be the same in the absence of a prefix', function() {
    assert(geop.baseApp === geop.app);
  });

  var request = require('request');

  var jar;

  function getCsrfToken(jar) {
    var csrfCookie = _.find(jar.getCookies('http://localhost:7900/'), { key: geop.csrfCookieName });
    if (!csrfCookie) {
      return null;
    }
    var csrfToken = csrfCookie.value;
    return csrfToken;
  }

  it('should successfully make a GET request to establish CSRF', function(done) {
    // otherwise request does not track cookies
    jar = request.jar();
    request({
      method: 'GET',
      url: 'http://localhost:7900/tests/welcome',
      jar: jar
    }, function(err, response, body) {
      assert(!err);
      assert(body.toString() === 'ok');
      done();
    });
  });

  it('should flunk a POST request with no X-XSRF-TOKEN header', function(done) {
    request({
      method: 'POST',
      url: 'http://localhost:7900/tests/body',
      form: {
        person: {
          age: '30'
        }
      },
      jar: jar,
      headers: {}
    }, function(err, response, body) {
      assert(!err);
      assert(response.statusCode === 403);
      done();
    });
  });

  it('should flunk a POST request with no cookies at all', function(done) {
    request({
      method: 'POST',
      url: 'http://localhost:7900/tests/body',
      form: {
        person: {
          age: '30'
        }
      },
      headers: {}
    }, function(err, response, body) {
      assert(!err);
      assert(response.statusCode === 403);
      done();
    });
  });

  it('should flunk a POST request with the wrong CSRF token', function(done) {
    var csrfToken = 'BOGOSITY';
    request({
      method: 'POST',
      url: 'http://localhost:7900/tests/body',
      form: {
        person: {
          age: '30'
        }
      },
      jar: jar,
      headers: {
        'X-XSRF-TOKEN': csrfToken
      }
    }, function(err, response, body) {
      assert(!err);
      assert(response.statusCode === 403);
      done();
    });
  });

  it('should use the extended bodyParser for submitted forms', function(done) {
    var csrfToken = getCsrfToken(jar);
    assert(csrfToken);
    // Should be a true randomized token since
    // disableAnonSession is not active
    assert(csrfToken !== 'csrf-fallback');
    request({
      method: 'POST',
      url: 'http://localhost:7900/tests/body',
      form: {
        person: {
          age: '30'
        }
      },
      jar: jar,
      headers: {
        'X-XSRF-TOKEN': csrfToken
      }
    }, function(err, response, body) {
      assert(!err);
      assert(body.toString() === '30');
      done();
    });
  });

  it('should allow us to implement a route that requires the JSON bodyParser', function(done) {
    var csrfToken = getCsrfToken(jar);
    request({
      method: 'POST',
      url: 'http://localhost:7900/tests/body',
      json: {
        person: {
          age: '30'
        }
      },
      jar: jar,
      headers: {
        'X-XSRF-TOKEN': csrfToken
      }
    }, function(err, response, body) {
      assert(!err);
      assert(body.toString() === '30');
      done();
    });
  });

  it('should be able to implement a route with geoportal-module.route', function(done) {
    var csrfToken = getCsrfToken(jar);
    request({
      method: 'POST',
      url: 'http://localhost:7900/modules/express-test/test2',
      json: {
        person: {
          age: '30'
        }
      },
      jar: jar,
      headers: {
        'X-XSRF-TOKEN': csrfToken
      }
    }, function(err, response, body) {
      assert(!err);
      assert(body.toString() === '30');
      // Last one before a new apos object
      return t.destroy(apos, done);
    });
  });

  // PREFIX STUFF

  it('should set prefix on the apos object if passed in', function(done) {
    apos = require('../index.js')({
      root: module,
      shortName: 'test',
      prefix: '/prefix',
      modules: {
        'geoportal-express': {
          port: 7900,
          csrf: false
        },
        'express-test': {},
        'templates-test': {
          ignoreNoCodeWarning: true
        },
        'templates-subclass-test': {
          ignoreNoCodeWarning: true
        }
      },
      afterInit: function(callback) {
        assert(geop.prefix);
        assert(geop.prefix === '/prefix');
        // In tests this will be the name of the test file,
        // so override that in order to get geoportal to
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

  it('should have different baseApp and app properties with a prefix', function() {
    assert(geop.app !== geop.baseApp);
  });

  it('should take same requests at the prefix', function(done) {
    request({
      method: 'POST',
      url: 'http://localhost:7900/prefix/tests/body',
      form: {
        person: {
          age: '30'
        }
      }
    }, function(err, response, body) {
      assert(!err);
      assert(body.toString() === '30');
      // Last one before a new apos object
      return t.destroy(apos, done);
    });
  });

  it('should provide reasonable absolute and base URLs in tasks reqs if baseUrl option is set on apos object', function(done) {

    apos = require('../index.js')({
      root: module,
      shortName: 'test',
      baseUrl: 'https://example.com',
      modules: {
        'geoportal-express': {
          port: 7900,
          csrf: false
        },
        'express-test': {},
        'templates-test': {
          ignoreNoCodeWarning: true
        },
        'templates-subclass-test': {
          ignoreNoCodeWarning: true
        }
      },
      afterInit: function(callback) {
        assert(geop.baseUrl);
        assert(geop.baseUrl === 'https://example.com');
        // In tests this will be the name of the test file,
        // so override that in order to get geoportal to
        // listen normally and not try to run a task. -Tom
        geop.argv._ = [];
        return callback(null);
      },
      afterListen: function(err) {
        assert(!err);
        var req = geop.tasks.getReq({ url: '/test' });
        assert(req.baseUrl === 'https://example.com');
        assert(req.absoluteUrl === 'https://example.com/test');
        // Last one before a new apos object
        return t.destroy(apos, done);
      }
    });
  });

  it('should provide reasonable absolute and base URLs in tasks reqs if baseUrl and prefix options are set on apos object', function(done) {

    apos = require('../index.js')({
      root: module,
      shortName: 'test',
      baseUrl: 'https://example.com',
      prefix: '/subdir',
      modules: {
        'geoportal-express': {
          port: 7900,
          csrf: false
        },
        'express-test': {},
        'templates-test': {
          ignoreNoCodeWarning: true
        },
        'templates-subclass-test': {
          ignoreNoCodeWarning: true
        }
      },
      afterInit: function(callback) {
        assert(geop.baseUrl);
        assert(geop.baseUrl === 'https://example.com');
        assert(geop.prefix === '/subdir');
        // In tests this will be the name of the test file,
        // so override that in order to get geoportal to
        // listen normally and not try to run a task. -Tom
        geop.argv._ = [];
        return callback(null);
      },
      afterListen: function(err) {
        assert(!err);
        var req = geop.tasks.getReq({ url: '/test' });
        assert(req.baseUrl === 'https://example.com');
        assert(req.baseUrlWithPrefix === 'https://example.com/subdir');
        assert(req.absoluteUrl === 'https://example.com/subdir/test');
        // Last use of this apos object
        return t.destroy(apos, done);
      }
    });
  });
});
