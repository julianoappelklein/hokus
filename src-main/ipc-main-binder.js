//@flow

let { ipcMain } = require('electron');
let api = require('./api');

let enableLogging = process.env.ENV==='DEVELOPMENT';

exports.bind = function(){

    let handlers = {};

    function addListener(key/*: string*/){
        if(api.hasOwnProperty(key)){

            if(enableLogging)
                console.log('IPC_MAIN_BIND_LISTENER: '+key);

            handlers[key] = function(event, args){

                let context = {};

                context.reject = function(error){
                    let pack = {
                        key: key+"Response",
                        token: args.token,
                        response: {error:error?error.stack:'Something went wrong.'}
                    };
                    event.sender.send('messageAsyncResponse', pack);
                    console.log('IPC_MAIN_FAIL: '+ key, pack);
                }

                context.resolve = function(response){
                    let pack = {
                        key: key+"Response",
                        token: args.token,
                        response
                    };
                    event.sender.send('messageAsyncResponse', pack);
                    console.log('IPC_MAIN_RESPONDED: '+ key, pack);
                }

                if(enableLogging)
                    console.log('IPC_MAIN_REQUESTED: '+ key, args);

                api[key](args.data, context);
            };
        }
        else{
            throw `Could not find API method for key '${key}'.`;
        }
    };

    for(var key in api){
        if(!key.startsWith('_'))
            addListener(key);
    }

    ipcMain.on('message', function(event, args){
        if(args.handler===undefined)
            throw 'Could not find handler key in message.';

        let handler = handlers[args.handler];

        if(handler===undefined)
            throw `Could not find handler for key '${args.handler}'.`;

        handler(event, args);
    });
}