const formatProviderResolver = require('./../../format-provider-resolver');
const joi = require('joi');
const path = require('path');

const dataFormatsPiped = formatProviderResolver.allFormatsExt().join('|');

let validationUtils= {
    contentFormatReg: new RegExp('^(md|mmark)$'),
    dataFormatReg: new RegExp('^('+dataFormatsPiped+')$'),
    allFormatsReg: new RegExp('^('+dataFormatsPiped+'|md|mmark)$')
}

class WorkspaceConfigValidator {

    normalizeConfig(config){
        if(config){
            if(!config.collections) config.collections = [];
            if(!config.singles) config.singles = [];
        }
    }

    validate(config){

        this.normalizeConfig(config);

        let validationError = joi.validate(config,
            joi.object().keys({
                hugover: joi.string().trim().required(),
                collections: joi.array().required(),
                singles: joi.array().required(),
                build: joi.array().items(joi.object().keys({
                    key:joi.string(),
                    config:joi.string().required()
                })),
                serve: joi.array().items(joi.object().keys({
                    key:joi.string(),
                    config:joi.string().required()
                }))
            }).required()
        ).error;

        if(validationError) return validationError.message;

        let validationErrorMessage;

        validationErrorMessage = config.collections.map(x => this.validateCollection(x)).find(x=> x!==null);
        if(validationErrorMessage) return validationErrorMessage;

        validationErrorMessage = config.singles.map(x => this.validateSingle(x)).find(x=> x!==null);
        if(validationErrorMessage) return validationErrorMessage;
        
        return null;
    }

    validateCollection(collection){

        let validationError = null;

        validationError = joi.validate(collection, joi.object().required().error(new Error('The collection configuration is required.'))).error;
        if(validationError) return validationError.message;

        //validate all fields common to content or data files
        validationError = joi.validate(collection,
            joi.object().keys({
                key: joi.string().trim().alphanum().min(3).max(30).required().error(new Error('The key value is invalid.')),
                title: joi.string().trim().min(3).max(30).required().error(new Error('The title value is invalid.')),
                folder: joi.string().trim().regex(/^(content|data).+$/).regex(/^(?!.*[.][.]).*$/).required().error(new Error('The folder value is invalid.')),
                itemtitle: joi.string().trim().min(3).max(30).error(new Error('The itemtitle value is invalid.')),
                extension: joi.string().regex(validationUtils.allFormatsReg).required().error(new Error('The extension value is invalid.')),
                dataformat: joi.string().trim().error(new Error('The dataformat value is invalid.')), //is not required here
                fields: joi.array().min(1).required().error(new Error('The fields value is invalid.'))
            })
        ).error;

        if(validationError) return validationError.message;

        if(validationUtils.contentFormatReg.test(collection.extension)){
            //content files, data format is required
            validationError = joi.validate(collection.dataformat,
                joi.string().regex(validationUtils.dataFormatReg).required().error(new Error('The dataformat value is invalid.'))
            ).error;

            if(validationError) return validationError.message;
        }
        else{
            //data files, dataformat must be empty or match extension
            if(collection.dataformat && collection.dataformat != collection.extension){
                return 'The dataformat value does not match the extension value.';
            }
        }        
        return null;
    }

    validateSingle(single){

        let validationError = null;

        validationError = joi.validate(single, joi.object().required().error(new Error('The single configuration is required.'))).error;
        if(validationError) return validationError.message;

        //validate all fields common to content or data files
        validationError = joi.validate(single,
            joi.object().keys({
                key: joi.string().trim().alphanum().min(3).max(30).required().error(new Error('The x value is invalid.')),
                title: joi.string().trim().min(3).max(30).required().error(new Error('The x value is invalid.')),
                file: joi.string().trim().regex(/^(content|data|config[.]).+$/).regex(/^(?!.*[.][.]).*$/).required().error(new Error('The x value is invalid.')),
                dataformat: joi.string().trim().error(new Error('The x value is invalid.')),
                fields: joi.array().min(1).required().error(new Error('The x value is invalid.'))
            })
        ).error;

        if(validationError) return validationError.message;
        
        let extension = path.extname(single.file).replace('.','');
        if(single.file.startsWith('content')){
            //content file, dataformat must be provided
            validationError = joi.validate(single.dataformat,
                joi.string().trim().regex(validationUtils.dataFormatReg).required().error(new Error('The x value is invalid.'))
            ).error;

            if(validationError) return validationError.message;
        }
        else{
            //data file, dataformat must be empty or match extension
            if(single.dataformat && single.dataformat!==extension)
                return 'The dataformat value does not match the file value.';

        }

        return null;
    }
}

module.exports = WorkspaceConfigValidator;