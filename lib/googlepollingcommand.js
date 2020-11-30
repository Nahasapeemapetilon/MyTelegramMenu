const MyUtility = require('./myutility');
const MyCommandBase = require('./mycommandbase');
const GoogleStateHandler = require('./googlestatehandler');

module.exports = class GooglePollingCommand extends MyCommandBase
{
  constructor(){
    super();
    this._EnumName =  '';
    this._stateName = '';
    this._toSet = '';
    this._StateHandler = new GoogleStateHandler();
  }
  parseMessage(){
    try{
      if(this._message !== undefined && this._message.length > 0)
      {
       const tSplit = this._message.split(' ');
       if(tSplit.length > 2)
          this._EnumName = tSplit[0];
       this._stateName = tSplit.slice(1).join(' ');
      }
    }
    catch(error){
      this._EnumName  = '';
      this._stateName = '';
    }

  }

  executeCommand(){
    try{
      if(this._EnumName ==='' || this._stateName ==='')
        return
    const states = this._StateHandler.findState(this._EnumName,this._stateName);
    if(states.length == 0 )
      MyUtility.getInstance().console.log([ MyUtility.getTranslatedMsg("noLamp"),this._stateName]);
    states.forEach((item,i)=>{

      if(item.isCommonTypeABoolean()){
        const tOldValue = item.getObjectValue();
        MyUtility.getInstance().setState(item.getObjectID(),!tOldValue,()=>{});
      }
    });
    }
    catch(error)
    {
      MyUtility.getInstance().console.log(["Der Google-Befehl konnte nicht ausgeführt werden:",error]);
    }
  }

}
