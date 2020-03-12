// @flow

const glob = require('glob');

const action /*: (params: { expression: string, options: ?any }) => Promise<Array<string>>*/ = async ({ expression, options }) => {
    return new Promise((resolve, reject) => {
        glob(expression, options, (err, matches) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(matches);
        })
    })
}

module.exports = action;