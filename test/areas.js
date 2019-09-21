var t = require('../test-lib/test.js');
var assert = require('assert');
var async = require('async');
var apos;

describe('Areas', function() {

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

      modules: {
        'geoportal-express': {
          secret: 'xxx',
          port: 7900,
          csrf: false
        },
        'monkeys': {
          extend: 'geoportal-pieces',
          name: 'monkey'
        },
        'monkeys-widgets': {
          extend: 'geoportal-pieces-widgets'
        }
      },
      afterInit: function(callback) {
        assert(geop.modules['geoportal-areas']);
        assert(geop.areas);
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

  it('returns the rich text of an area via the richText method', function() {
    assert(geop.areas.richText({
      type: 'area',
      items: [
        {
          type: 'geoportal-rich-text',
          content: '<h2>So cool</h2>'
        },
        {
          type: 'something-else',
          content: '<h3>Do not return me</h3>'
        },
        {
          type: 'geoportal-rich-text',
          content: '<h2>Something else cool</h2>'
        }
      ]
    }) === '<h2>So cool</h2>\n<h2>Something else cool</h2>');
    assert(geop.areas.richText({
      type: 'area',
      items: [
        {
          type: 'geoportal-rich-text',
          content: '<h2>So cool</h2>'
        },
        {
          type: 'something-else',
          content: '<h3>Do not return me</h3>'
        },
        {
          type: 'geoportal-rich-text',
          content: '<h2>Something else cool</h2>'
        }
      ]
    }, { delimiter: '' }) === '<h2>So cool</h2><h2>Something else cool</h2>');
    assert(geop.areas.richText({
      type: 'area',
      items: [
        {
          type: 'geoportal-rich-text',
          content: '<h2>So cool</h2>'
        },
        {
          type: 'something-else',
          content: '<h3>Do not return me</h3>'
        },
        {
          type: 'geoportal-rich-text',
          content: '<h2>Something else cool</h2>'
        }
      ]
    }, { wrapper: 'div' }) === '<div><h2>So cool</h2></div><div><h2>Something else cool</h2></div>');
  });

  it('returns the plaintext of an area via the plaintext method', function() {
    assert.strictEqual(geop.areas.plaintext({
      type: 'area',
      items: [
        {
          type: 'geoportal-rich-text',
          content: '<h2>So cool</h2>'
        },
        {
          type: 'something-else',
          content: '<h3>Do not return me</h3>'
        },
        {
          type: 'geoportal-rich-text',
          content: '<h2>Something else cool</h2>'
        }
      ]
    }), 'So cool\nSomething else cool');
    assert.strictEqual(geop.areas.plaintext({
      type: 'area',
      items: [
        {
          type: 'geoportal-rich-text',
          content: '<h2>So cool</h2>'
        },
        {
          type: 'something-else',
          content: '<h3>Do not return me</h3>'
        },
        {
          type: 'geoportal-rich-text',
          content: '<h2>Something else cool</h2>'
        }
      ]
    }, { limit: 15 }), 'So cool...');
  });

  it('area considered empty when it should be', function() {
    var doc = {
      type: 'test',
      _id: 'test',
      body: {
        type: 'area',
        items: []
      },
      emptyText: {
        type: 'area',
        items: [
          {
            _id: 'test2',
            type: 'geoportal-rich-text',
            content: ''
          }
        ]
      },
      insignificantText: {
        type: 'area',
        items: [
          {
            _id: 'test2',
            type: 'geoportal-rich-text',
            content: '<h4> </h4>'
          }
        ]
      },
      insignificantPieces: {
        type: 'area',
        items: [
          {
            _id: 'test3',
            type: 'monkeys',
            _pieces: []
          }
        ]
      }
    };
    assert(geop.areas.isEmpty({ area: doc.body }));
    assert(geop.areas.isEmpty(doc, 'body'));
    assert(geop.areas.isEmpty(doc, 'nonexistent'));
    assert(geop.areas.isEmpty(doc, 'emptyText'));
    assert(geop.areas.isEmpty(doc, 'insignificantText'));
    assert(geop.areas.isEmpty(doc, 'insignificantPieces'));
  });

  it('area not considered empty when it should not be', function() {
    var doc = {
      type: 'test',
      _id: 'test',
      body: {
        type: 'area',
        items: [
          {
            _id: 'test2',
            type: 'geoportal-video',
            url: 'http://somewhere.com'
          }
        ]
      },
      emptyText: {
        type: 'area',
        items: [
          {
            _id: 'test2',
            type: 'geoportal-rich-text',
            content: ''
          }
        ]
      },
      fullText: {
        type: 'area',
        items: [
          {
            _id: 'test2',
            type: 'geoportal-rich-text',
            content: '<h4>Some text</h4>'
          }
        ]
      },
      significantPieces: {
        type: 'area',
        items: [
          {
            _id: 'test3',
            type: 'monkeys',
            _pieces: [
              {
                type: 'monkey'
              }
            ]
          }
        ]
      }
    };
    assert(!geop.areas.isEmpty({ area: doc.body }));
    assert(!geop.areas.isEmpty(doc, 'body'));
    assert(!geop.areas.isEmpty(doc, 'fullText'));
    assert(!geop.areas.isEmpty({ area: doc.fullText }));
    assert(!geop.areas.isEmpty(doc, 'significantPieces'));
  });

  it('both isEmpty and legacy empty methods work on schema fields', function() {
    assert(
      !geop.schemas.fieldTypes.boolean.isEmpty({
        type: 'boolean',
        name: 'test'
      }, true)
    );
    assert(
      geop.schemas.fieldTypes.boolean.isEmpty({
        type: 'boolean',
        name: 'test'
      }, false)
    );
    assert(
      !geop.schemas.fieldTypes.boolean.empty({
        type: 'boolean',
        name: 'test'
      }, true)
    );
    assert(
      geop.schemas.fieldTypes.boolean.empty({
        type: 'boolean',
        name: 'test'
      }, false)
    );
  });

  it('when simultaneous updates are attempted to different areas, nothing gets lost', function(done) {
    var home;
    var req = geop.tasks.getReq();
    async.series([
      getHome,
      simultaneousUpdates,
      verifyUpdates
    ], function(err) {
      assert(!err);
      done();
    });
    function getHome(callback) {
      return geop.pages.find(req, { slug: '/' }).toObject(function(err, _home) {
        assert(!err);
        assert(_home);
        home = _home;
        return callback(null);
      });
    }
    function simultaneousUpdates(callback) {
      var areas = [ 'one', 'two', 'three', 'four' ];
      return async.each(areas, function(area, callback) {
        return geop.areas.lockSanitizeAndSaveArea(req, {
          docId: home._id,
          dotPath: area,
          items: [
            {
              type: 'geoportal-rich-text',
              content: area
            }
          ]
        }, callback);
      }, callback);
    }
    function verifyUpdates(callback) {
      return geop.pages.find(req, { slug: '/' }).toObject(function(err, _home) {
        assert(!err);
        assert(home);
        home = _home;
        var areas = [ 'one', 'two', 'three', 'four' ];
        areas.forEach(function(area) {
          assert(home[area]);
          assert(home[area].items[0].content === area);
        });
        return callback(null);
      });
    }
  });
});
