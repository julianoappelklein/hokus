const { describe, before, it } = require('mocha');
const { expect } = require('chai');
const assert = require('assert');
const { HugoDownloader, OfficialHugoPackagesRepository } = require('./src-main/hugo-downloader');
// const formatProviderResolver = require('./src-main/format-provider-resolver');
// const WorkspaceService = require('./src-main/workspace-service')

describe('HugoDownloader', () => {

    describe('OfficialHugoPackagesRepository', () => {
        it('should build the expected url', ()=>{
            let url = new OfficialHugoPackagesRepository().buildDownloadUrl('linux', '64', '0.37');
            expect(url).to.equal('https://github.com/gohugoio/hugo/releases/download/v0.37/hugo_0.37_Linux-64bit.tar.gz');
        });
    });

    describe('ExtractForLinux', () => {
        it('should build the expected url', ()=>{
            let dowloader = new HugoDownloader();
            expect(url).to.equal('https://github.com/gohugoio/hugo/releases/download/v0.37/hugo_0.37_Linux-64bit.tar.gz');
        });
    });
});