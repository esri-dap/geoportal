var async = require('async');
var _ = require('@sailshq/lodash');
var Promise = require('bluebird');

module.exports = function(self, options) {

  self.migrations = [];

  // Legacy cache of migrations performed
  self.enableCache = function() {
    self.cache = self.geop.caches.get(self.__meta.name);
  };

  // How we now track migrations performed: a mongodb collection (persistent)
  self.enableCollection = function(callback) {
    return self.geop.db.collection('aposMigrations', function(err, db) {
      if (err) {
        return callback(err);
      }
      self.db = db;
      return callback(null);
    });
  };

  self.addMigrationTask = function() {
    self.geop.tasks.add(self.__meta.name, 'migrate', 'Apply any necessary migrations and consistency adjustments to the database.', self.migrationTask);
  };

  self.migrationTask = function(apos, argv, callback) {
    return self.geop.promiseEmit('migrate', argv).then(function() {
      return callback(null);
    }).catch(callback);
  };

  self.addCollectionMigration = function() {
    // Must run first, otherwise the other migrations all get re-run
    self.migrations.unshift({
      name: 'migrationCollection',
      options: { safe: true },
      callback: function(callback) {
        var names = _.pluck(self.migrations, 'name');
        return async.eachSeries(names, function(name, callback) {
          return self.cache.get(name, function(err, result) {
            if (err) {
              return callback(err);
            }
            if (!result) {
              return callback(null);
            }
            return self.db.findOne({ _id: name }, function(err, result) {
              if (err) {
                return callback(err);
              }
              if (result) {
                return callback(null);
              }
              return self.db.insert({ _id: name }, callback);
            });
          });
        }, callback);
      }
    });
  };

  self.afterInit = function() {
    // Add migrations for all Sortified schema fields in doc types
    self.addSortifyMigrations();
    // Add our own migration at the last possible minute so we can
    // prepend before all others
    self.addCollectionMigration();
    // Here because if we add it in geoportal-pieces it will
    // actually be added once per subclass which is inefficient
    self.addDeduplicatePiecesInTrashMigration();
    // Here for consistency with the above
    self.addDeduplicatePagesInTrashMigration();
  };

  self.addDeduplicatePiecesInTrashMigration = function() {
    var req = self.geop.tasks.getReq();
    return self.geop.migrations.add('deduplicatePiecesInTrash', function() {
      return self.geop.migrations.eachDoc({
        trash: true,
        $and: [
          {
            slug: {
              $not: /^\//
            }
          }, {
            slug: {
              $not: /deduplicate/
            }
          }
        ]
      }, function(piece) {
        var manager = self.geop.docs.getManager(piece.type);
        if (!manager) {
          return;
        }
        if (!self.geop.synth.instanceOf(manager, 'geoportal-pieces')) {
          return;
        }
        return Promise.promisify(manager.deduplicateTrash)(req, piece);
      });
    });
  };

  self.addDeduplicatePagesInTrashMigration = function() {
    if (!self.geop.docs.trashInSchema) {
      // This mechanism is not used for pages unless trash is an
      // ordinary schema field rather than a place in the tree
      return;
    }
    var req = self.geop.tasks.getReq();
    return self.geop.migrations.add('deduplicatePagesInTrash', function() {
      return self.geop.migrations.eachDoc({
        trash: true,
        $and: [
          {
            slug: /^\//
          }, {
            slug: {
              $not: /deduplicate/
            }
          }
        ]
      }, function(page) {
        if (page.slug === '/trash') {
          // legacy trashcan does not get deduplicated
          return;
        }
        var manager = self.geop.docs.getManager(page);
        if (!manager) {
          return;
        }
        if (!self.geop.synth.instanceOf(manager, 'geoportal-custom-pages')) {
          return;
        }
        return Promise.promisify(manager.deduplicateTrash)(req, page);
      });
    });
  };

  self.addSortifyMigrations = function() {
    var managers = self.geop.docs.managers;
    _.each(managers, function(manager, name) {
      var schema = manager.schema;
      if (!schema) {
        return;
      }
      _.each(schema, function(field) {
        if (field.name === 'title') {
          // Was always sortified, migration would be redundant
          return;
        }
        if (!field.sortify) {
          return;
        }
        manager.addSortifyMigration(field.name);
      });
    });
  };

  self.migrate = function(options, callback) {
    return self.geop.locks.lock(self.__meta.name, function(err) {
      if (err) {
        return callback(err);
      }
      return async.eachSeries(self.migrations, function(migration, callback) {
        if (options.safe && (!migration.options.safe)) {
          return setImmediate(callback);
        }
        return self.runOne(migration, function(err) {
          return callback(err);
        });
      }, function(err) {
        return self.geop.locks.unlock(self.__meta.name, function(_err) {
          return callback(err || _err);
        });
      });
    });
  };

  self.runOne = function(migration, callback) {
    return self.db.findOne({ _id: migration.name }, function(err, info) {
      if (err) {
        return callback(err);
      }
      if (info) {
        // We don't need to run it again
        return callback(null);
      }
      self.geop.utils.log('Running database migration: ' + migration.name);
      var fn = migration.callback;
      if (migration.callback.length === 0) {
        fn = function(callback) {
          return Promise.try(function() {
            return migration.callback();
          }).then(function() {
            return callback(null);
          }).catch(callback);
        };
      }
      return fn(function(err) {
        if (err) {
          self.geop.utils.error(err);
          return callback(err);
        }
        return self.db.insert({ _id: migration.name, at: new Date() }, done);
      });
      function done(err) {
        if (err) {
          return callback(err);
        } else {
          self.geop.utils.log('Completed database migration: ' + migration.name);
          return callback(null);
        }
      }
    });
  };
};
