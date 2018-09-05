/* @flow */

let ActionRunner = require('./action-runner');

let factories = {};

factories.createThumbnailJob = (src /* : string */, dest /* : string */)=> {
    var pathToModule = require.resolve('./create-thumbnail-action');
    return new ActionRunner(pathToModule, {src, dest});
}

module.exports = factories;