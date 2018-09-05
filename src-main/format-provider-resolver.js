const fs = require('fs-extra');
const jsYaml = require('js-yaml');
const path = require('path');
const tomlify = require('tomlify-j0.4');
const toml = require('toml');

class JsonFormatProvider{

    defaultExt(){
        return 'json';
    }

    matchContentFirstLine(line){
        return line.startsWith('{');
    }

    parse(str){
        return JSON.parse(str);
    }

    dump(obj){
        return JSON.stringify(obj, null, '  ');
    }

    dumpContent(obj){
        let content = '';
        if(obj.mainContent){
            content = obj.mainContent;
            delete obj.mainContent;
        }
        let header = this.dump(obj);
        return `${header}

${content}`;
    }

    parseFromMdFileString(str){
        let data = str;
        let jsonEnd = /^} *(\r?\n|\r|^)/m.exec(data).index;
        // TODO: make it more robust
        // what if the file only has a json?
        // and what if it only has a markdown?

        let json, md;

        if(jsonEnd===-1){
            json = '{}';
            md = data;
        }
        else{
            json = data.substr(0,jsonEnd+1);
            md = data.substr(jsonEnd+1);
        }            
        
        let parsedData = this.parse(json);
        if(parsedData===undefined){
            return {};
        }
        
        if (/\S/.test(md)) { //if have non thitespaces
            //remove the two first line breaks
            md = md.replace(/(\r?\n|\r)/,'').replace(/(\r?\n|\r)/,'');
            parsedData.mainContent = md;
        }
        
        return parsedData;
    }
}

class TomlFormatProvider{

    defaultExt(){
        return 'toml';
    }

    matchContentFirstLine(line){
        return line.startsWith('+++');
    }

    parse(str){
        return toml.parse(str);
    }

    dump(obj){
        return tomlify.toToml(obj, {space: 2});
    }

    dumpContent(obj){
        let content = '';
        if(obj.mainContent){
            content = obj.mainContent;
            delete obj.mainContent;
        }
        let header = this.dump(obj);
        return `+++
${header}
+++

${content}`;
    }

    parseFromMdFileString(str){
        let data = str;
        let reg = /^[+]{3} *(\r?\n|\r|^)/mg;
        let tomlEnd;
        for(let i = 0; i < 2; i++){
            let execResult = reg.exec(data);
            if(execResult===null)
                break;
            if(i===1)
                tomlEnd = execResult.index;
        }      

        let tomlStr, md;

        if(tomlEnd===-1){
            tomlStr = '';
            md = data;
        }
        else{
            tomlStr = data.substr(3,tomlEnd-3);
            md = data.substr(tomlEnd+3);
        }            
        
        let parsedData = this.parse(tomlStr);
        if(parsedData===undefined){
            return {};
        }
        
        if (/\S/.test(md)) { //if have non thitespaces
            //remove the two first line breaks
            md = md.replace(/(\r?\n|\r)/,'').replace(/(\r?\n|\r)/,'');
            parsedData.mainContent = md;
        }
        
        return parsedData;
    }
}

class YamlFormatProvider{

    defaultExt(){
        return 'yaml';
    }

    matchContentFirstLine(line){
        return line.startsWith('---');
    }

    parse(str){
        return jsYaml.load(str);
    }

    dump(obj){
        return jsYaml.dump(obj);
    }

    dumpContent(obj){
        let content = '';
        if(obj.mainContent){
            content = obj.mainContent;
            delete obj.mainContent;
        }
        let header = this.dump(obj);
        return `---
${header}
---

${content}`;
    }

    parseFromMdFileString(str){
        let data = str;
        let reg = /^[-]{3} *(\r?\n|\r|^)/mg;
        let yamlEnd;
        for(let i = 0; i < 2; i++){
            let execResult = reg.exec(data);
            if(execResult===null)
                break;
            if(i===1)
                yamlEnd = execResult.index;
        }      

        let yamlStr, md;

        if(yamlEnd===-1){
            yamlStr = '';
            md = data;
        }
        else{
            yamlStr = data.substr(3,yamlEnd-3);
            md = data.substr(yamlEnd+3);
        }            
        
        let parsedData = this.parse(yamlStr);
        if(parsedData===undefined){
            return {};
        }
        
        if (/\S/.test(md)) { //if have non thitespaces
            //remove the two first line breaks
            md = md.replace(/(\r?\n|\r)/,'').replace(/(\r?\n|\r)/,'');
            parsedData.mainContent = md;
        }
        
        return parsedData;
    }
}

class FormatProviderResolver{
    
    constructor(){
        this._formats = {
            json: new JsonFormatProvider(),
            toml: new TomlFormatProvider(),
            yaml: new YamlFormatProvider()
        }
        this._formats.yml = this._formats.yaml;

        this._exts = [];
        for(let key in this._formats){
            this._exts.push(key);
        }
    }

    getDefaultFormat(){
        return this._formats.yaml;
    }

    getDefaultFormatExt(){
        return 'yaml';
    }

    _getFileLinePromise(filename, line_no) {
        return new Promise((resolve, reject) =>{
                        
            var stream = fs.createReadStream(filename, {
                flags: 'r',
                encoding: 'utf8',
                fd: null,
                mode: '0666',
                bufferSize: 64 * 1024
            });
        
            var fileData = '';
            stream.on('data', function(data){
                fileData += data;
                // The next lines should be improved
                var lines = fileData.split("\n");
                if(lines.length >= +line_no){
                    stream.destroy();
                    resolve(lines[+line_no]);
                }
            });
        
            stream.on('error', (e)=>{
                reject(e);
            });
        
            stream.on('end', function(){
                resolve(undefined);
            });
            
        });
    }

    resolveForMdFirstLine(line){
        if(line===undefined)
            return undefined;
        for(let i = 0; i < this._exts.length; i++){
            let f = this._formats[this._exts[i]];
            if(f.matchContentFirstLine(line))
                return f;
        }
        return undefined;
    }

    resolveForFilePath(filePath){
        if(filePath===undefined)
            return undefined;
        let ext = path.extname(filePath).replace('.','');
        return this.resolveForExtension(ext);
    }

    resolveForMdFileString(fileContent){
        if(fileContent===undefined)
            return undefined;
        let firstLine = fileContent.split('\n', 1)[0];
        return this.resolveForMdFirstLine(firstLine);
    }

    resolveForMdFilePromise(filePath){
        return this._getFileLinePromise(filePath,0)
        .then((line)=>{
            return Promise.resolve(this.resolveForMdFirstLine(line));
        });
    }

    resolveForExtension(ext){
        if(ext===undefined)
            return undefined;

        ext = ext.toLowerCase();

        return this._formats[ext];
    }

    allFormatsExt(){
        return this._exts;
    }
}

module.exports = new FormatProviderResolver();