//@flow

let path = require('path');

const SUPPORTED_CONTENT_EXTENSIONS = ['md','markdown','html'];

module.exports.SUPPORTED_CONTENT_EXTENSIONS = SUPPORTED_CONTENT_EXTENSIONS;

module.exports.allValidContentFilesExt = function(filePath /*: string */){
    return filePath && (filePath.endsWith('.md') || filePath.endsWith('.markdown'));
}

module.exports.isContentFile = function(filePath /*: string */){
    if(filePath===undefined) return false;
    let parts = filePath.split('.');
    return SUPPORTED_CONTENT_EXTENSIONS.indexOf(parts[parts.length-1])>=0;
}