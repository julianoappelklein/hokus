/* @flow */

let jobsManager = require('./job-manager');

module.exports.createThumbnailJob = (src /* : string */, dest /* : string */) => {
    return jobsManager.runSharedBackgroundJob(
        `create-thumbnail-job:${src}->${dest}`,
        require.resolve('./create-thumbnail-job'),
        { src, dest }
    );
}

module.exports.globJob = (expression /* : string */, options /* : any */) => {
    return jobsManager.runSharedBackgroundJob(
        `glob-job:${expression}(${JSON.stringify(options)})`,
        require.resolve('./glob-job'),
        { expression, options }
    );
}