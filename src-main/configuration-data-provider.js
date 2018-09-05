const osenv = require('osenv');
const glob = require('glob');
const fs = require('fs-extra');
const path = require('path');
const pathHelper = require('./path-helper');
const formatProviderResolver = require('./format-provider-resolver');
const outputConsole = require('./output-console');

let configurationCache = undefined;

const supportedFormats = formatProviderResolver.allFormatsExt().join(',');
const defaultPathSearchPattern = (pathHelper.getRoot() + 'config.{'+supportedFormats+'}').replace(/\\/gi,'/');
const namespacedPathSearchPattern = (pathHelper.getRoot() + 'config.*.{'+supportedFormats+'}').replace(/\\/gi,'/');

let EMPTY_CFG = {
    empty:true,
    fileSearchPatterns: [defaultPathSearchPattern, namespacedPathSearchPattern]
};
function emptyCfg(){
    return EMPTY_CFG;
}

function normalizeConfig(config){

    if(typeof(config)==='string'){
        config = JSON.parse(config);
    }

    if(config===undefined || config.sites === undefined || config.sites.length===0){
        return emptyCfg();
    }

    function normalizeSite(sites){
        if(sites.collections===undefined)
            sites.collections = [];
        if(sites.singles===undefined)
            sites.singles = [];
        return sites;
    }

    config.sites = config.sites.map(normalizeSite);

    _configurations = config;

    return config;
}

function get(callback, {invalidateCache}={}){

    if(invalidateCache===true)
        configurationCache = undefined;

    if(configurationCache){
        callback(undefined, configurationCache);
        return;
    }

    let files = glob.sync(defaultPathSearchPattern)
        .concat(glob.sync(namespacedPathSearchPattern))
        .map(x=>path.normalize(x));
        
    let configurations = {sites:[]};

    for(let i = 0; i < files.length; i++){
        let file = files[i];
        if(fs.existsSync(file)){
            try{
                let strData = fs.readFileSync(file, {encoding: 'utf-8'});
                let formatProvider = formatProviderResolver.resolveForFilePath(file);
                let data = formatProvider.parse(strData);
                data = normalizeConfig(data);
                if(data!=EMPTY_CFG){
                    configurations.sites = configurations.sites.concat(data.sites);
                }
                else{
                    outputConsole.appendLine(`Configuration file '${file}' is empty.`);
                }
            }
            catch(e){
                outputConsole.appendLine(`Configuration file is invalid '${file}': ${e.toString()}`);
            }
        }
    }
    
    if(configurations.sites.length>0){
        configurationCache = configurations;
        callback(undefined, configurations);
    }
    else{
        callback(undefined, EMPTY_CFG);
    }
    
}

module.exports = { get }