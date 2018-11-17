//@flow

const glob = require('glob');
const fs = require('fs-extra');
const path = require('path');
const pathHelper = require('./path-helper');
const formatProviderResolver = require('./format-provider-resolver');
const outputConsole = require('./output-console');
const Joi = require('joi');

let configurationCache = undefined;

const supportedFormats = formatProviderResolver.allFormatsExt().join(',');
const defaultPathSearchPattern = (pathHelper.getRoot() + 'config.{'+supportedFormats+'}').replace(/\\/gi,'/');
const namespacedPathSearchPattern = (pathHelper.getRoot() + 'config.*.{'+supportedFormats+'}').replace(/\\/gi,'/');
const globalConfigPattern = (pathHelper.getRoot() + 'config.{'+supportedFormats+'}').replace(/\\/gi,'/');
/*::
    import type { SiteConfig } from './../global-types';
*/


let EMPTY_CFG = {
    empty:true,
    fileSearchPatterns: [defaultPathSearchPattern, namespacedPathSearchPattern]
};
function emptyCfg(){
    return EMPTY_CFG;
}



function normalizeSite(site/*: SiteConfig*/)/*: void*/{
    
}

function validateSite(site/*: SiteConfig*/)/*: void*/{
    if(site==null){
        throw new Error(`Site config can't be null.`);
    }
    const schema = Joi.object().keys({
        key: Joi.string().required(),
        name: Joi.string().required(),
        source: Joi.object().required(),
        serve: Joi.array(),
        build: Joi.array(),
        publish: Joi.array(),
        transform: Joi.array()
    });
    const result = Joi.validate(site, schema);
    if(result.error)
        throw result.error;
}


const GLOBAL_DEFAULTS = {
    debugEnabled: false,
    cookbookEnabled: true,
    siteManagementEnabled: true
}

function invalidateCache(){
    configurationCache = undefined;
}

function get(callback/*: (err: ?Error, data: any)=>void*/, {invalidateCache}/*: {invalidateCache?: bool}*/ = {}){

    if(invalidateCache===true)
        configurationCache = undefined;

    if(configurationCache){
        callback(undefined, configurationCache);
        return;
    }

    let files = glob.sync(defaultPathSearchPattern)
        .concat(glob.sync(namespacedPathSearchPattern))
        .map(x=>path.normalize(x));
        
    let configurations/*: { sites: Array<{}>, global: {} }*/ = {sites:[], global: GLOBAL_DEFAULTS};

    for(let i = 0; i < files.length; i++){
        let file = files[i];
        if(fs.existsSync(file)){
            try{
                let strData = fs.readFileSync(file, {encoding: 'utf-8'});
                let formatProvider = formatProviderResolver.resolveForFilePath(file);
                if(formatProvider==null) throw new Error(`Could not resolve a format provider for file ${file}.`)
                let site = formatProvider.parse(strData);
                validateSite(site);
                normalizeSite(site);
                site.configPath = file;
                configurations.sites.push(site);
                
            }
            catch(e){
                outputConsole.appendLine(`Configuration file is invalid '${file}': ${e.toString()}`);
            }
        }
    }

    let globalConfigFile = (glob.sync(globalConfigPattern)||[])[0];
    if(globalConfigFile){
        try{
            let strData = fs.readFileSync(globalConfigFile, {encoding: 'utf-8'});
            let formatProvider = formatProviderResolver.resolveForFilePath(globalConfigFile);
            if(formatProvider==null) throw new Error(`Could not resolve a format provider for "${globalConfigFile}".`)
            let global = formatProvider.parse(strData);
            global = {
                debugEnabled: global.debugEnabled == null ? GLOBAL_DEFAULTS.debugEnabled : global.debugEnabled===true, //default false
                cookbookEnabled: global.cookbookEnabled == null ? GLOBAL_DEFAULTS.cookbookEnabled : global.debugEnabled===true, //default true
                siteManagementEnabled: global.siteManagementEnabled == null ? GLOBAL_DEFAULTS.siteManagementEnabled : global.siteManagementEnabled===true
            }
            configurations.global = global;
        }
        catch(e){
            outputConsole.appendLine(`Global configuration file is invalid '${globalConfigFile}': ${e.toString()}`);
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
function getPromise(options/*::?:{invalidateCache?: bool}*/){
    return new Promise((resolve, reject)=>{
        get((err, data)=>{
            if(err) reject(err);
            else resolve(data);
        }, options);
    });
}

module.exports = { get, getPromise, invalidateCache }