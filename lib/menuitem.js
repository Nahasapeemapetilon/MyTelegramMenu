const TelegramArray = require('./telegramarray');
const EventEmitter = require('events');
const MyUtility = require('./myutility');
const StateObject = require('./stateobject');

module.exports = class MenuItem  extends EventEmitter {
  constructor (parent,name,objectID){
    super();
    this._parent = parent;
    this._items = [];
    this._itemName = name;
    this._stateObject = new StateObject(objectID);
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
  //iobroker state object
  getObject(){
    if(this._stateObject)
      return this._stateObject.getObject();
    return undefined;
  }
  getMaxValue(){
    return this.getStateObject().getMaxValue();
  }
  getMinValue(){
    return this.getStateObject().getMinValue();
  }
  //internal state object
  getStateObject(){
    return this._stateObject;
  }
  getObjectUnit(){
    return  this.getStateObject().getObjectUnit();
  }
  isObjectWriteable(){
    return this.getStateObject().isWriteable();
  }

  isObjectAButton(){
    return this.getStateObject().isObjectAButton();
  }
  isObjectASwitch() {
    return this.getStateObject().isObjectASwitch();
  }
  isObjectTypeAState(){
    return this.getStateObject().isObjectTypeAState();
  }
  isObjectTypeADeviceOrChannel()
  {
    return this.getStateObject().isObjectTypeADeviceOrChannel();
  }
  isCommonTypeANumber(){
    return this.getStateObject().isCommonTypeANumber();
  }

  isCommonTypeABoolean(){
      return this.getStateObject().isCommonTypeABoolean();
  }

  isObjectTypeAEnum(){
    return this.getStateObject().isObjectTypeAEnum();
  }



  getItemStateValue()
  {
    return this.getStateObject().getObjectValue()
  }

  setItemStateValue(state){
    if(this.hasItems())
        this._items.forEach(item =>{ item.setItemStateValue(state);});
    else{
      if(this._objectID)
      {
         let tOldValue = this.getItemStateValue() ;
         if(this.isCommonTypeABoolean())
          MyUtility.getInstance().setState(this._objectID,!tOldValue,this.callBackStateChangeToTelegram());
         else if(this.isCommonTypeANumber())
         {
           if(typeof state === 'number')
            MyUtility.getInstance().setState(this._objectID,state,this.callBackStateChangeToTelegram());
         }
       }
      }
    }

  callBackStateChangeToTelegram()
  {
    if(!MyUtility.getOptions().feedbackToTelegram)
      return;
    setTimeout(()=>{
    const tNewValue = MyUtility.getInstance().getState(this._objectID).val;
    let tMsg = ``;
    if(this.isCommonTypeANumber())
    {
      const unitOfCommon = this.getStateObject().getObjectUnit();
      tMsg = MyUtility.getTranslatedMsg("SetNumber") + `: ${tNewValue} ${unitOfCommon} ${this.Name}` ;
    }
    else if(this.isObjectAButton())
      tMsg = MyUtility.getTranslatedMsg("ButtonChange")+ ":" + this.Name;
    else if(this.isObjectASwitch())
    {
      if(tNewValue)
        tMsg = MyUtility.getTranslatedMsg("SwitchOn") + ":"+this.Name;
      else
        tMsg = MyUtility.getTranslatedMsg("SwitchOff") + ":"+this.Name;
    }
    if(tMsg !== ``)
      MyUtility.sendMsgToTelegram(tMsg);
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
    MyUtility.getInstance().sendTo(MyUtility.getOptions().telegramInstance, {
         chatId : MyUtility.getInstance().getState(MyUtility.getOptions().telegramInstance +'.communicate.requestChatId'/*Chat ID of last received request*/).val,
         text:    MyUtility.getTranslatedMsg("pleaseChoose") ,
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

  GetNodeElementsForTelegraph(){
    if(this.hasItems()){
      const onlyStates = this._items.filter((item)=>item.isObjectTypeAState());
      const nodeElements = [];
      nodeElements.push({tag:"h4" , children:[this.Name]})
      if(onlyStates.length > 0){
        nodeElements.push({tag:"ul", children: [...onlyStates.map(item=>item.GetNodeElementsForTelegraph())]});
        nodeElements.push({tag: 'hr'})
      }
      const onlyDeviceAndChannels = this._items.filter((item)=>item.isObjectTypeADeviceOrChannel() || item.isObjectTypeAEnum());
      onlyDeviceAndChannels.map(item=>item.GetNodeElementsForTelegraph()).forEach(SubItems =>
        {
          if(SubItems)
            SubItems.forEach(item=>nodeElements.push(item));
        });
      return nodeElements;
    }
    else if(this.isObjectTypeAState()){
      const value = this.getItemStateValue();
      let valueAsString ='';
      let icon = '😖';
       if(value == null || value == undefined)
       {
         valueAsString = MyUtility.getTranslatedMsg('noValue');
         icon = '😡';
       }
      else if(this.isCommonTypeABoolean())
        {
           let typeString ="";
           if(this.isObjectASwitch())
             typeString = MyUtility.getTranslatedMsg("switch");
           else if(this.isObjectAButton())
             typeString = MyUtility.getTranslatedMsg("button");
          valueAsString = typeString +  MyUtility.getTranslatedMsg(value?"on":"off");
          icon = (value)?"✅":"❌";
        }
      else if(this.isCommonTypeANumber())
      {
          const unitOfCommon = this.getStateObject().getObjectUnit();
          valueAsString = `${value} ${unitOfCommon}`
          if(unitOfCommon == "V")
            icon = "⚡";
          else if(unitOfCommon =="W")
            icon = "💪";
          else {
            icon = "";
          }
      }
        else
          valueAsString = value.toString();
      const returnString = `${this.Name} : ${valueAsString} ${icon}`;
      return {tag:"li", children:[returnString] };
    }
  }

   static createMenuItem(parent,name,objectID){
    return new MenuItem(parent,name,objectID);
  }
}
