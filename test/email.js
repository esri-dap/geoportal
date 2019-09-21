var t = require('../test-lib/test.js');
var assert = require('assert');
var apos;

describe('Email', function() {

  this.timeout(t.timeout);

  after(function(done) {
    return t.destroy(apos, done);
  });

  it('should be a property of the apos object', function(done) {
    this.timeout(t.timeout);
    this.slow(2000);

    apos = require('../index.js')({
      root: module,
      shortName: 'test',

      modules: {
        'geoportal-express': {
          port: 7900
        },
        'geoportal-email': {
          nodemailer: {
            streamTransport: true,
            buffer: true,
            newline: 'unix'
          }
        },
        'email-test': {}
      },
      afterInit: function(callback) {
        assert(geop.modules['geoportal-email']);
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

  it('can send email on behalf of a module', function(done) {
    geop.modules['email-test'].email(geop.tasks.getReq(),
      'welcome',
      {
        name: 'Fred Astaire'
      },
      {
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Welcome Aboard'
      },
      function(err, info) {
        assert(!err);
        assert(info);
        var message = info.message.toString();
        assert(message.match(/Fred Astaire/));
        assert(message.match(/Subject: Welcome Aboard/));
        assert(message.match(/From: test@example\.com/));
        assert(message.match(/To: recipient@example\.com/));
        assert(message.match(/\[http:\/\/example\.com\/\]/));
        done();
      }
    );
  });
  it('can do it with promises', function() {
    return geop.modules['email-test'].email(geop.tasks.getReq(),
      'welcome',
      {
        name: 'Fred Astaire'
      },
      {
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Welcome Aboard'
      }
    ).then(function(info) {
      assert(info);
      var message = info.message.toString();
      assert(message.match(/Fred Astaire/));
      assert(message.match(/Subject: Welcome Aboard/));
      assert(message.match(/From: test@example\.com/));
      assert(message.match(/To: recipient@example\.com/));
      assert(message.match(/\[http:\/\/example\.com\/\]/));
      return true;
    });
  });
});
