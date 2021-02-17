const MyUtility = require('./myutility');
module.exports = class MyCommandBase{
  constructor(){
    this._message = undefined;
    this._currentCommand = undefined;
  }
  getMessageFromInput(pInput){
    pInput = pInput || '';
    return pInput;
  }

  onRequest(inputMsg){
    this._message = this.getMessageFromInput(inputMsg);
    if(!this._message.trim())
      return;
    this.parseMessage();
    this.executeCommand();
  }

  parseMessage(){

  }

  executeCommand(){
  }
}
