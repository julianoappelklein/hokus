/* @flow */

let ActionRunner = require('./action-runner');

module.exports.createThumbnailJob = (src /* : string */, dest /* : string */)=> {
    var pathToModule = require.resolve('./create-thumbnail-action');
    return new ActionRunner(pathToModule, {src, dest});
}

module.exports.globJob = (expression /* : string */, options /* : any */) => {
    var pathToModule = require.resolve('./glob-action');
    return new ActionRunner(pathToModule, {expression, options});
}