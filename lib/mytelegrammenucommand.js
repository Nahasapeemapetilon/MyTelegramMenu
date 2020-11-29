const MyUtility = require('./myutility');
const MyCommandBase = require('./mycommandbase');

module.exports = class MyTelegramMenuCommand extends MyCommandBase{
  constructor(pMenu){
    super();
    this._mainMenu = pMenu;
    this._naviMap = MyUtility.getNaviMap();
    this._currentUser = undefined;
  }
  getMessageFromInput(pInput){
    const { newState: { val: NewStateVal } } = pInput;
    if(NewStateVal)
      return NewStateVal;
    return '';
  }
  parseMessage(){
    if(typeof this._message ==='string' ||
        this._message instanceof String)
        {
          if(this._message.length  > 0)
          {
            var tIdx = this._message.indexOf("]");
            this._currentUser = this._message.substring(1,tIdx);
            this._currentCommand = this._message.substring(tIdx+1,this._message.length);
          }
    }
  }
  executeCommand(){    
    if(this._currentCommand  === undefined || this._currentUser === undefined)
      return;
      this._mainMenu.setCurrentUser(this._currentUser);
    if(this._currentCommand === MyUtility.getOptions().showRootItemsCommand)
      this._mainMenu.ShowRootItems();
    else if(this._currentCommand === this._naviMap['Top'].Command)
      this._mainMenu.ShowTopItem();
    else if(this._currentCommand ===  this._naviMap['Next'].Command)
      this._mainMenu.ShowNextItem();
    else if(this._currentCommand === this._naviMap['Prev'].Command)
      this._mainMenu.ShowPrevItem();
    else if(this._currentCommand === this._naviMap['Info'].Command)
      this._mainMenu.BuildReport();
    else {
      let tItem = this._mainMenu.GetItemBy(this._currentCommand);
      if(tItem !== undefined)
      {
        if(tItem.hasItems())
          this._mainMenu.ShowItem(tItem);
        else
        {
          if(tItem.isObjectWriteable())
            this._mainMenu.SetItemStateValue(tItem);
          else
            this._mainMenu.SendItemValueToTelegram(tItem);
        }
      }
    }
  }
}
