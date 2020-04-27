import { BaseService } from "./base-service";
import mainProcessBridge from "./../utils/main-process-bridge";

class SnackMessageService extends BaseService {
  _snackMessageQueue: Array<any>;
  _currentSnackMessage: any;
  _previousSnackMessage: any;

  constructor() {
    super();
    this._snackMessageQueue = [];
    this._currentSnackMessage = undefined;
    this._previousSnackMessage = undefined;
  }

  _tryAssingCurrentSnack() {
    if (this._currentSnackMessage !== undefined)
      //well have to wait until someone clear the _currentSnackMessage
      return false;

    let snackMessage = this._snackMessageQueue.shift();
    if (snackMessage) {
      this._currentSnackMessage = snackMessage;
      return true;
    }
    return false;
  }

  addSnackMessage(
    message: string,
    {
      action,
      onActionClick,
      autoHideDuration = 3000
    }: { action?: string; onActionClick?: () => void; autoHideDuration?: number } = {}
  ) {
    this._snackMessageQueue.push({ message, action, onActionClick, autoHideDuration });
    if (this._tryAssingCurrentSnack()) this._notifyChanges();
  }

  reportSnackDismiss() {
    this._previousSnackMessage = this._currentSnackMessage;
    this._currentSnackMessage = undefined;
    this._tryAssingCurrentSnack();
    this._notifyChanges();
  }

  getCurrentSnackMessage() {
    return this._currentSnackMessage;
  }

  getPreviousSnackMessage() {
    return this._previousSnackMessage;
  }
}

class ConsoleService extends BaseService {
  _consoleIsHiddden: boolean;
  _consoleTimeout: any;
  _consoleMessages: Array<{ id: number; line: string }>;
  _consoleBuffer: Array<{ id: number; line: string }>;
  consoleMessageLastId: number;

  constructor() {
    super();
    this._consoleIsHiddden = true;
    this._consoleMessages = [
      {
        id: -2,
        line: "This is the application output console. Here you can learn about what is happening behind the scenes."
      },
      { id: -1, line: "" }
    ];
    this._consoleBuffer = [];
    this._consoleTimeout = undefined;
    this.consoleMessageLastId = 0;
    mainProcessBridge.addMessageHandler("console", this._onConsole.bind(this));
  }

  _onConsole({ line }: { line: string }) {
    //throttle this?
    this._consoleBuffer.push({ id: this.consoleMessageLastId++, line });
    if (this._consoleTimeout) clearTimeout(this._consoleTimeout);

    this._consoleTimeout = setTimeout(() => {
      let max = 100;
      this._consoleMessages = this._consoleMessages.concat(this._consoleBuffer);
      this._consoleBuffer = [];
      if (this._consoleMessages.length > max) {
        this._consoleMessages = this._consoleMessages.slice(this._consoleMessages.length - max, max);
      }
      this._notifyChanges();
    }, 50);
  }

  getConsoleMessages() {
    return this._consoleMessages;
  }

  getConsoleIsHidden() {
    return this._consoleIsHiddden;
  }

  toggleConsoleVisibility() {
    this._consoleIsHiddden = !this._consoleIsHiddden;
    this._notifyChanges();
  }
}

class BlockingOperationService extends BaseService {
  _operations: Array<{ key: string; title: string }> = [];

  public isBlocked = () => {
    return this._operations.length > 0;
  };

  startOperation(config: { key: string; title: string; maxDuration?: number }) {
    this._operations = this._operations.filter(x => x.key !== config.key);
    this._operations.push(config);
    if (config.maxDuration) {
      setTimeout(() => {
        this.endOperation(config.key);
      });
    }
    this._notifyChanges();
  }

  endOperation(key: string) {
    this._operations = this._operations.filter(x => x.key !== key);
    this._notifyChanges();
  }

  getRunningBlockingOperations() {
    return this._operations;
  }
}

export const snackMessageService = new SnackMessageService();
export const consoleService = new ConsoleService();
export const blockingOperationService = new BlockingOperationService();
