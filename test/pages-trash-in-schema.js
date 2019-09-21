var t = require('../test-lib/test.js');
var assert = require('assert');

var apos;

describe('Pages', function() {

  this.timeout(t.timeout);

  after(function(done) {
    return t.destroy(apos, done);
  });

  // EXISTENCE

  it('should be a property of the apos object', function(done) {
    apos = require('../index.js')({
      root: module,
      shortName: 'test',

      modules: {
        'geoportal-express': {
          secret: 'xxx',
          port: 7900
        },
        'geoportal-docs': {
          trashInSchema: true
        },
        'geoportal-pages': {
          park: [],
          types: [
            {
              name: 'home',
              label: 'Home'
            },
            {
              name: 'testPage',
              label: 'Test Page'
            }
          ]
        }
      },
      afterInit: function(callback) {
        assert(geop.pages);
        geop.argv._ = [];
        return callback(null);
      },
      afterListen: function(err) {
        assert(!err);
        done();
      }
    });
  });

  it('parked homepage exists', function(done) {
    return geop.pages.find(geop.tasks.getAnonReq(), { level: 0 }).toObject(function(err, home) {
      assert(!err);
      assert(home);
      assert(home.slug === '/');
      assert(home.path === '/');
      assert(home.type === 'home');
      assert(home.parked);
      assert(home.published);
      done();
    });
  });

  it('should be able to use db to insert documents (one is trash)', function(done) {
    var testItems = [
      { _id: 'one',
        type: 'testPage',
        slug: '/one',
        published: true,
        path: '/one',
        level: 1,
        rank: 0
      },
      {
        _id: 'two',
        type: 'testPage',
        slug: '/two',
        published: true,
        path: '/two',
        level: 1,
        rank: 1,
        trash: true
      }
    ];

    geop.docs.db.insert(testItems, function(err) {
      assert(!err);
      done();
    });

  });

  it('should be able to move second page above first page in tree without changing its trash status', function(done) {
    geop.pages.move(geop.tasks.getReq(), 'two', 'one', 'before', function(err) {
      if (err) {
        console.log(err);
      }
      assert(!err);
      var cursor = geop.pages.find(geop.tasks.getAnonReq(), { _id: 'two' }).trash(true);
      cursor.toObject(function(err, page) {
        if (err) {
          console.log(err);
        }
        assert(!err);
        assert(page.rank === 0);
        assert(page.trash);
        done();
      });
    });

  });

});
