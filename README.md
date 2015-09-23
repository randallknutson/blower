This module will search all package.json files for a property and return the merge results.

### Usage
var blower = require('blower')(require);
blower.implements('dependencies');

This will return all the dependencies of all node modules within the project in a merged object.

Note: Be sure to pass in the require function when initializing. It is used to find the root of the project and is local to each module.