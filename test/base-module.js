var t = require('../test-lib/test.js');
var assert = require('assert');

describe('Base Module', function() {

  var apos;

  after(function(done) {
    return t.destroy(apos, done);
  });

  this.timeout(t.timeout);

  it('should be subclassable', function(done) {
    apos = require('../index.js')({
      root: module,
      shortName: 'test',

      modules: {
        // will push an asset for us to look for later
        'geoportal-test-module-push': {},
        // test the getOption method of modules
        'test-get-option': {}
      },
      afterInit: function(callback) {
        assert(geop.test && geop.test.color === 'red');
        return done();
      }
    });
  });

  it('should provide geop.assets with the right context for pushing assets', function(done) {
    var found = false;
    for (var i = geop.assets.pushed.stylesheets.length - 1; i >= 0; i--) {
      if (geop.assets.pushed.stylesheets[i].file === __dirname + '/lib/modules/geoportal-test-module-push/public/css/test.css') {
        found = true;
        break;
      }
    };
    assert(found);
    return done();
  });

  it('should produce correct responses via the getOption method', function() {
    var mod = geop.modules['test-get-option'];
    var req = geop.tasks.getReq();
    assert.equal(mod.getOption(req, 'flavors.grape.sweetness'), 20);
    assert.equal(mod.getOption(req, 'flavors.cheese.swarthiness'), undefined);
    assert.equal(mod.getOption(req, 'flavors.grape.ingredients.0'), 'chemicals');
    var markup = mod.render(req, 'test.html');
    assert(markup.match(/^\s*20\s*$/));
  });
});
