//@flow

/*:: 
    type MessageHandler = (eventData:any, arg:any) => void;
*/

class MainProcessBridge{

    /*::    
    ipcRenderer : {
        send: (string, any) => void,
        on: (
            event:string,
            MessageHandler
        ) => void
    };

    _messageHandlers : { [string] : Array<MessageHandler> }; 

    pendingCallbacks : Array<{ token: string, handler:MessageHandler }>;

    */

    constructor(){

        this._messageHandlers = {};
        this.ipcRenderer = window.require('electron').ipcRenderer;
        this.pendingCallbacks = [];

        this.ipcRenderer.on('messageAsyncResponse', (event, arg) => {
            const { token, response, key } = arg;
            let callback = this._getCallback(token);
            if(callback){
                callback(response);
                console.log('Returned response:', JSON.stringify(response), key);
            }
            else{
                console.log('Response without callback.', key);
            }
        });

        this.ipcRenderer.on('message', (sender, message) => {
            if(message.type){
                let handlers = this._messageHandlers[message.type];
                if(handlers){
                    for(let i = 0; i < handlers.length; i++){
                        handlers[i](message.data);
                    }
                }
            }
            else{
                console.log('Received message withtou a type.');
            }
        });
    }

    addMessageHandler(type /* : string */, handler/* : MessageHandler */){
        let handlers = this._messageHandlers[type];
        if(handlers===undefined){
            handlers = [];
            this._messageHandlers[type] = handlers;
        }
        handlers.push(handler);
    }

    removeMessageHandler(type /* : string */, handler/* : MessageHandler */){
        let handlers = this._messageHandlers[type];
        if(handlers===undefined){
            return;
        }
        handlers.splice(handlers.indexOf(handler),1);
    }

    _createToken() /*: string */ {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); 
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    _getCallback(token /* : string */) /*: ?MessageHandler */ {
        for(let i = 0; i < this.pendingCallbacks.length;i ++){
            let callback = this.pendingCallbacks[i];
            if(callback.token===token)
                return callback.handler;
        }
        return undefined;
    }

    _eraseCallback(token /* : string */){
        for(let i = 0; i < this.pendingCallbacks.length;i ++){
            let callback = this.pendingCallbacks[i];
            if(callback.token===token){
                this.pendingCallbacks.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    _emptyFunction(){

    }

    request(method /*: string */, data /*: any */ , opts /* : {timeout:number} */ ={timeout:10000}){
        let _reject;
        let token = this._createToken();
        let promise = new Promise(function(resolve, reject){
            _reject = reject;
            this.ipcRenderer.send('message', {data, token, handler:method});
            let timeoutId = setTimeout(function(){
                if(this._eraseCallback(token)){
                    reject('timeout');
                    //$FlowFixMe
                    promise.forceAbort = function(){};
                }
            }.bind(this), opts.timeout);
            this.pendingCallbacks.push({
                token,
                handler: function(response){
                    clearTimeout(timeoutId);
                    if(response && response.error){
                        reject(response.error);
                    }
                    resolve(response);
                    //$FlowFixMe
                    promise.forceAbort = function(){};
                }
            });
        }.bind(this));

        //$FlowFixMe
        promise.forceAbort = function(){
            console.log('Promise aborted.');
            _reject('Cancelled');
            this._eraseCallback(token);
        }.bind(this);

        return promise;
    }

    requestVoid(method /* : string */, data /* : any */){
        this.ipcRenderer.send('message', {data, handler:method});
    }
}

export default new MainProcessBridge();