const PLATFORMS = {
    linux:'linux',
    windows:'windows',
    macOS:'macOS'
}

const ARCHS = {
    x64:'x64',
    x32:'x32'
}

class EnvironmentResolver{
    resolve(){
        let platform = process.platform;
        if(platform.startsWith("win")){
            platform=PLATFORMS.windows;
        }
        else if(platform.startsWith("linux")){
            platform=PLATFORMS.linux;
        }
        else if(platform.startsWith("darwin")){
            platform=PLATFORMS.macOS;
        }
        else{
            throw new Error('Could not resolve environment. Platform not supported.');
        }

        let arch = ARCHS[process.arch];
        if(arch===undefined)
            throw new Error('Could not resolve environment. Arch not supported.');

        return {platform, arch};
    }
}

module.exports = {
    ARCHS,
    PLATFORMS,
    EnvironmentResolver
}