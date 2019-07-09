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
    this._objectType = undefined;
    this._commonType = undefined;
    this._objectUnit = undefined;
    this._objectRole = undefined;
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
  getObject(){
    if(this._objectID)
      return MyUtility.getInstance().getObject(this._objectID);
    return undefined;
  }

  getObjectType()
  {
    if(this._objectType == undefined)
    {
      const tObject = this.getObject();
      this._objectType = '';
      if(tObject)
      {
        const {type:objectType} = tObject;
        if(objectType)
          this._objectType = objectType;
      }
    }
    return this._objectType;
  }
  getCommonType()
  {
    if(this._commonType == undefined)
    {
      const tObject = this.getObject()
      this._commonType = '';
      if(tObject)
      {
        if(this.isObjectTypeAState())
        {
          const { common: { type: typeOfCommon } } = tObject;
          if(typeOfCommon)
            this._commonType = typeOfCommon;
          }
      }
    }
    return this._commonType;
  }
  getObjectRole()
  {
    if(!this._objectRole)
    {
      const tObject = this.getObject()
      if(tObject)
      {
          const { common: { role: roleOfCommon } } = tObject;
          if(roleOfCommon)
            this._objectRole = roleOfCommon;
      }
    }
    return this._objectRole;
  }
  getObjectUnit()
  {
    if(this._objectUnit == undefined)
    {
        let tObject = this.getObject()
        if(tObject)
        {
          const { common: { unit: unitOfCommon } } = tObject;
          if(unitOfCommon)
            this._objectUnit =  unitOfCommon;
        }
    }
    return this._objectUnit;
  }
  isObjectWriteable()
  {
      let tObject = this.getObject()
      if(tObject)
      {
          const { common: { write: writeAble } } = tObject;
          if(writeAble != undefined)
            return writeAble;
      }
      return false;
  }
  isObjectRoleA(input)
  {
    const objectRole = this.getObjectRole();
    return objectRole.indexOf(input) !== -1;
  }
  isObjectAButton()
  {
    return this.isObjectRoleA('button')
  }
  isObjectASwitch()
  {
    return this.isObjectRoleA('switch')
  }
  isObjectTypeAState()
  {
    const objectType = this.getObjectType();
    return objectType === 'state';
  }
  isObjectTypeADeviceOrChannel()
  {
    const objectType = this.getObjectType();
    const tListAllowed = ['device','channel'];
    return tListAllowed.some((element)=> element === objectType);
  }
  isCommonTypeANumber()
  {
    const objectType = this.getCommonType();
    return objectType === 'number';
  }
  isCommonTypeABoolean()
  {
    const objectType = this.getCommonType();
    return objectType === 'boolean';
  }
  getItemState()
  {
    if(this._objectID)
         return MyUtility.getInstance().getState(this._objectID).val;
     return "";
  }

  setItemState(state){
    if(this.hasItems())
        this._items.forEach(item =>{ item.setItemState(state);});
    else{
      if(this._objectID)
      {
         let tOldValue = MyUtility.getInstance().getState(this._objectID).val;
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
      const unitOfCommon = this.getObjectUnit();
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
   static createMenuItem(parent,name,objectID){
    return new MenuItem(parent,name,objectID);
  }
}
