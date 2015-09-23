
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

module.exports = function(require, searchDependencies) {
  searchDependencies = typeof searchDependencies === 'undefined' ? true : false;
  // Initialize cache variables.
  var packages = {};
  var implements = {};

  /**
   * Find all package files that are referenced by the module or its dependencies.
   *
   * @returns {{}}
   */
  var getPackages = function() {
    if (!_.isEmpty(packages)) {
      return packages;
    }
    packages = packageDependencies(path.normalize(require.main.paths[0] + '/..'));
    packages['main'] = path.normalize(require.main.paths[0] + '/../package.json');
    return packages;
  };

  var packageDependencies = function(dir) {
    var packageFiles = {};
    var packageJson = require(dir + '/package.json');
    _.each(packageJson.dependencies, function(version, dependency) {
      if (!packageFiles[dependency]) {
        var dependencyDir = dir + '/node_modules/' + dependency;
        if (fs.existsSync(dependencyDir + '/package.json')) {
          packageFiles[dependency] = dependencyDir + '/package.json';
          if (searchDependencies) {
            packageFiles = _.assign(packageDependencies(dependencyDir), packageFiles);
          }
        }
      }
    });
    return packageFiles;
  };

  return {
    /**
     * Find and return any modules that implement the requested functionality.
     */
    implements: function(feature, cb) {
      // Return cached if it exists.
      if (implements[feature]) {
        return implements[feature];
      }
      implements[feature] = {};
      var packageFiles = getPackages();
      _.each(packageFiles, function(file, package) {
        var packageJson = require(file);
        if (_.has(packageJson, feature)) {
          implements[feature] = _.merge(packageJson[feature], implements[feature]);
        }
      });
      return implements[feature];
    }
  }
}