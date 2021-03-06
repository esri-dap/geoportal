var async = require('async');

// Properly clean up an geoportal instance and drop its
// database collections to create a sane environment for the next test.
// Drops the collections, not the entire database, to avoid problems
// when testing something like a mongodb hosting environment with
// credentials per database.

function destroy(apos, done) {
  if (!apos) {
    done();
    return;
  }
  return async.series([
    drop,
    destroy
  ], function(err) {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      process.exit(1);
    }
    return done();
  });
  function drop(callback) {
    if (!(geop.db && geop.db.collections)) {
      return callback(null);
    }
    return geop.db.collections(function(err, collections) {
      if (err) {
        return callback(err);
      }

      // drop the collections
      return async.eachSeries(collections, function(collection, callback) {
        if (!collection.collectionName.match(/^system\./)) {
          return collection.drop(callback);
        }
        return setImmediate(callback);
      }, callback);
    });
  }
  function destroy(callback) {
    if (!geop.destroy) {
      return callback(null);
    }
    return geop.destroy(callback);
  }
};

module.exports = {
  destroy: destroy,
  timeout: (process.env.TEST_TIMEOUT && parseInt(process.env.TEST_TIMEOUT)) || 5000
};
