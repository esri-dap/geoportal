var t = require('../test-lib/test.js');
var assert = require('assert');
var _ = require('@sailshq/lodash');

var apos;

describe('Users', function() {

  // Password hashing can be slow
  this.timeout(20000);

  after(function(done) {
    return t.destroy(apos, done);
  });

  // EXISTENCE

  it('should initialize', function(done) {
    apos = require('../index.js')({
      root: module,
      shortName: 'test',

      modules: {
        'geoportal-express': {
          secret: 'xxx',
          port: 7900
        }
      },
      afterInit: function(callback) {
        assert(geop.modules['geoportal-users']);
        geop.argv._ = [];
        assert(geop.users.safe.remove);
        return geop.users.safe.remove({}, callback);
        // return callback(null);
      },
      afterListen: function(err) {
        assert(!err);
        done();
      }
    });
  });

  var janeOne;

  // Test pieces.newInstance()
  it('should be able to insert a new user', function(done) {
    assert(geop.users.newInstance);
    var user = geop.users.newInstance();
    assert(user);

    user.firstName = 'Jane';
    user.lastName = 'Doe';
    user.title = 'Jane Doe';
    user.username = 'JaneD';
    user.password = '123password';
    user.email = 'jane@aol.com';

    assert(user.type === 'geoportal-user');
    assert(geop.users.insert);
    geop.users.insert(geop.tasks.getReq(), user, function(err) {
      assert(!err);
      janeOne = user;
      done();
    });

  });

  // verify a user's password
  // fail to verify the wrong password
  // fail to insert another user with the same email address
  // succeed in updating a user's property
  // verify a user's password after that user has been updated
  // change an existing user's password and verify the new password
  // verify that the user doc does not contain a password property at all

  // retrieve a user by their username
  it('should be able to retrieve a user by their username', function(done) {
    geop.users.find(geop.tasks.getReq(), { username: 'JaneD' })
      .toObject(function(err, user) {
        assert(!err);
        assert(user);
        assert(user.username === 'JaneD');
        done();
      }
      );
  });

  it('should verify a user password', function(done) {
    geop.users.find(geop.tasks.getReq(), { username: 'JaneD' })
      .toObject(function(err, user) {
        assert(!err);
        assert(user);
        assert(user.username === 'JaneD');

        geop.users.verifyPassword(user, '123password', function(err) {
          assert(!err);
          done();
        });
      });
  });

  it('should not verify an incorrect user password', function(done) {
    geop.users.find(geop.tasks.getReq(), { username: 'JaneD' })
      .toObject(function(err, user) {
        assert(!err);
        assert(user);
        assert(user.username === 'JaneD');

        geop.users.verifyPassword(user, '321password', function(err) {
          assert(err);
          done();
        });
      });
  });

  it('should not be able to insert a new user if their email already exists', function(done) {
    assert(geop.users.newInstance);
    var user = geop.users.newInstance();
    assert(user);

    user.firstName = 'Dane';
    user.lastName = 'Joe';
    user.title = 'Dane Joe';
    user.username = 'DaneJ';
    user.password = '321password';
    user.email = 'jane@aol.com';
    assert(user.type === 'geoportal-user');

    assert(geop.users.insert);
    geop.users.insert(geop.tasks.getReq(), user, function(err) {
      assert(err);
      done();
    });
  });

  it('should be able to move a user to the trash', function(done) {
    geop.users.trash(geop.tasks.getReq(), janeOne._id, function(err) {
      assert(!err);
      return geop.docs.db.findOne({_id: janeOne._id, trash: true}, function(err, doc) {
        assert(!err);
        assert(doc);
        done();
      });
    });
  });

  it('should be able to insert a user with a previously used email if the other is in the trash', function(done) {
    var user = geop.users.newInstance();

    user.firstName = 'Dane';
    user.lastName = 'Joe';
    user.title = 'Dane Joe';
    user.username = 'DaneJ';
    user.password = '321password';
    user.email = 'jane@aol.com';
    geop.users.insert(geop.tasks.getReq(), user, function(err) {
      assert(!err);
      done();
    });
  });

  it('should be able to rescue the first user from the trash and the email should be deduplicated', function(done) {
    geop.users.rescue(geop.tasks.getReq(), janeOne._id, function(err) {
      assert(!err);
      return geop.docs.db.findOne({ _id: janeOne._id, trash: { $ne: true } }, function(err, doc) {
        assert(!err);
        assert(doc);
        assert(doc.email.match(/deduplicate.*jane/));
        done();
      });
    });
  });

  it('there should be two users in the safe at this point and neither with a null username', function(done) {
    geop.users.safe.find({}).toArray(function(err, docs) {
      assert(!err);
      assert(docs.length === 2);
      _.each(docs, function(doc) {
        assert(doc.username);
      });
      done();
    });
  });

  it('should be able to move a user to the trash', function(done) {
    geop.users.trash(geop.tasks.getReq(), janeOne._id, function(err) {
      assert(!err);
      return geop.docs.db.findOne({_id: janeOne._id, trash: true}, function(err, doc) {
        assert(!err);
        assert(doc);
        done();
      });
    });
  });

  it('should be able to insert a user with a previously used username if the other is in the trash', function(done) {
    var user = geop.users.newInstance();

    user.firstName = 'Jane';
    user.lastName = 'Doe';
    user.title = 'Jane Doe';
    user.username = 'JaneD';
    user.password = '321password';
    user.email = 'somethingelse@aol.com';
    geop.users.insert(geop.tasks.getReq(), user, function(err) {
      assert(!err);
      done();
    });
  });

  it('should be able to rescue the first user from the trash and the username should be deduplicated', function(done) {
    geop.users.rescue(geop.tasks.getReq(), janeOne._id, function(err) {
      assert(!err);
      return geop.docs.db.findOne({ _id: janeOne._id, trash: { $ne: true } }, function(err, doc) {
        assert(!err);
        assert(doc);
        assert(doc.username.match(/deduplicate.*JaneD/));
        done();
      });
    });
  });

  it('there should be three users in the safe at this point and none with a null username', function(done) {
    geop.users.safe.find({}).toArray(function(err, docs) {
      assert(!err);
      assert(docs.length === 3);
      _.each(docs, function(doc) {
        assert(doc.username);
      });
      done();
    });
  });

  it('should succeed in updating a users property', function(done) {
    geop.users.find(geop.tasks.getReq(), { username: 'JaneD' })
      .toObject(function(err, user) {
        assert(!err);
        assert(user);
        assert(user.username === 'JaneD');
        user.firstName = 'Jill';
        geop.users.update(geop.tasks.getReq(), user, function(err) {
          assert(!err);
          geop.users.find(geop.tasks.getReq(), { _id: user._id })
            .toObject(function(err, user) {
              assert(!err);
              assert(user);
              assert(user.firstName === 'Jill');
              done();
            });
        });
      });
  });

  it('should verify a user password after their info has been updated', function(done) {
    geop.users.find(geop.tasks.getReq(), { username: 'JaneD' })
      .toObject(function(err, user) {
        assert(!err);
        assert(user);
        assert(user.username === 'JaneD');

        geop.users.verifyPassword(user, '321password', function(err) {
          assert(!err);
          done();
        });
      });
  });

  // change an existing user's password and verify the new password
  it('should change an existing user password and verify the new password', function(done) {
    geop.users.find(geop.tasks.getReq(), { username: 'JaneD' })
      .toObject(function(err, user) {
        assert(!err);
        assert(user);
        assert(user.username === 'JaneD');
        assert(!user.password);
        user.password = 'password123';
        geop.users.update(geop.tasks.getReq(), user, function(err) {
          assert(!err);
          geop.users.find(geop.tasks.getReq(), { username: 'JaneD' })
            .toObject(function(err, user) {
              assert(!err);
              assert(user);
              geop.users.verifyPassword(user, 'password123', function(err) {
                assert(!err);
                done();
              });
            });
        });
      });
  });

});
