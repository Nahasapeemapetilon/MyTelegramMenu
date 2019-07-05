const TelegramArray = require('./telegramarray');
const EventEmitter = require('events');
const MyUtility = require('./myutility');

module.exports = class MenuItem  extends EventEmitter {
  constructor (parent,name,objectID){
    super();
    this._parent = parent;
    this._items = [];
    this._itemName = name;
    this._objectID = objectID;
    this._currentIDX = 0;
    this._telegramArray = new TelegramArray(this);
  }
  //getter
  get Name () { return this._itemName; }
  get itemLength(){return this._items.length;}
  //methods
  addItem(item){
    if(item instanceof MenuItem){
      this._items.push(item);
      this._telegramArray.needUpdate = true;
    }
  }
  removeItem(item){
    this._items = this._items.filter(currentItem => currentItem !==item);
    this._telegramArray.needUpdate = true;
  }
  hasItems(){
    return this._items.length > 0;
  }
  getItemAt(i){
    return this._items[i] || null;
  }
  findItem(ItemName){
    if(this.hasItems())
      return this._items.find(item  => {return item.Name.trim() == ItemName.trim()});
    return undefined;
  }
  //handling States for IOBroker
  setItemState(state){
    if(this.hasItems())
        this._items.forEach(item =>{ item.setItemState(state);});
    else{
      if(this._objectID){
       let tObject = MyUtility.getInstance().getObject(this._objectID);
       if(tObject !== undefined && tObject.type === "state"){
         let tOldValue = MyUtility.getInstance().getState(this._objectID).val;
        MyUtility.getInstance().setState(this._objectID,!tOldValue,this.callBackStateChangeToTelegram(tObject));
       }
      }
    }
  }
  callBackStateChangeToTelegram(pObject)
  {
    setTimeout(()=>{
    let tNewValue = MyUtility.getInstance().getState(this._objectID).val;
      let tMsg = ``;
      if(pObject.hasOwnProperty('common'))
      {
        if(pObject.common.hasOwnProperty('role'))
        {
          if(pObject.common.role.indexOf('button') !== -1)
          {
            tMsg = `${this.Name} wurde geschaltet.`;
          }else if(pObject.common.role.indexOf('switch') !== -1 )
          {
            if(tNewValue)
              tMsg = `${this.Name} wurde angeschaltet`;
            else if (!tNewValue)
              tMsg = `${this.Name} wurde ausgeschaltet`;
          }
      }
      if(tMsg !== ``)
        MyUtility.getInstance().sendTo('telegram.0', {
          chatId : MyUtility.getInstance().getState('telegram.0.communicate.requestChatId').val,
          text:   tMsg
      });
    }
    },500);
  }
  //navigation
  ShowNextItemPage(){
    this._currentIDX++;
    if(this._currentIDX >= this._telegramArray.length)
    this._currentIDX = 0;
    this.ShowCurrentItems();
  }
  ShowPrevItemPage(){
    this._currentIDX--;
    if(this._currentIDX < 0)
        this._currentIDX = this._telegramArray.length-1;
    this.ShowCurrentItems();
  }
  //show current items in telegram
  ShowCurrentItems(){
    MyUtility.getInstance().sendTo('telegram.0', {
         chatId : MyUtility.getInstance().getState('telegram.0.communicate.requestChatId'/*Chat ID of last received request*/).val,
         text:   'Bitte Raum wählen:',
         reply_markup: {
             keyboard:
                 this._telegramArray.getTelegramArray(this._currentIDX)
             ,
             resize_keyboard:   true,
             one_time_keyboard: true
         }
     });

     this.emit("onItemChange",this);
  }
   static createMenuItem(parent,name,objectID){
    return new MenuItem(parent,name,objectID);
  }
}
