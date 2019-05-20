const EventEmitter = require('events');
class MyUtility{
  constructor(){}
  static getNameFromObj(obj){
    let name = '';
    if(obj)
    {
        if(obj.name.de)
         name = obj.name.de;
        else if(obj.name)
          name = obj.name;
    }
    return name;
  }
}
class TelegramArray{
  constructor(menuItem){
    this._menuItem = menuItem;
    this._iRowLength = 3;
    this._iColLength = 2;
    this._needUpdate = true;
    this._telegramArray = undefined;
  }
  set needUpdate(val){this._needUpdate = val;}
  get length (){
      if(this._telegramArray)
        return this._telegramArray.length;
      return 0;
      }
  //Anzahl Elemente auf einer Seite in Telegram
  get pageSize() {return this._iRowLength * this._iColLength;}
  getTelegramArray(idx){
    if(this._needUpdate ||
       this._telegramArray === undefined)
       this.generateArray();
    if(this.length >0 && idx < this.length)
      return this._telegramArray[idx];
    return [];
  }

  generateArray()
  {
    if(!this._needUpdate)
      return;
    let pagesList = [];
    let pageList = [];
    let internNamesList = [];
    let itemLength = this._menuItem.itemLength;
    for(let iCurrent = 0; iCurrent< this._menuItem.itemLength;iCurrent++){
      let currentItem = this._menuItem.getItemAt(iCurrent);
      if(iCurrent% this._iRowLength == 0 &&
         internNamesList.length > 0)
      {
        pageList.push(internNamesList);
        internNamesList = [];
      }
      internNamesList.push(currentItem.Name);
      if(iCurrent % this.pageSize == 0 &&
         pageList.length > 0)
      {
        pageList.push(["Prev","Top","Next"]);
        pagesList.push(pageList);
        pageList =[];
      }
    }
    if(internNamesList.length > 0 )
    {
     pageList.push(internNamesList);
     pageList.push(["Prev","Top","Next"]);
     pagesList.push(pageList);
    }
    this._telegramArray = pagesList;
    this._needUpdate = false;
  }
}
class MenuItem  extends EventEmitter {
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
       let tObject = getObject(this._objectID);
       if(tObject !== undefined && tObject.type === "state"){
        setState(this._objectID,!getState(this._objectID).val);
       }
      }
    }
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
    sendTo('telegram.0', {
         chatId : getState('telegram.0.communicate.requestChatId'/*Chat ID of last received request*/).val,
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
class MyTelegramMenu {
    constructor(){
    this._userIDX = 0;
    this._currentUser = '';
    this._currentMsg = '';
    this._currentCommand = '';
    this._users = [];
    on({id:'telegram.0.communicate.request',
      change: 'any'},this.onTelegramRequest.bind(this));
    }
    onTelegramRequest(){
      this.parseTelegramMsg();
      this.executeCommand();
    }
    parseTelegramMsg(){
      this._currentMsg = getState("telegram.0.communicate.request").val;
      let tIdx = this._currentMsg.indexOf("]");
      this._currentUser =  this._currentMsg.substring(1,tIdx);
      this._currentCommand  = this._currentMsg.substring(tIdx+1,this._currentMsg.length);
    }
    executeCommand(){
      if(this._currentCommand === '/menue')
        this.getRootItem().ShowCurrentItems();
      else if(this._currentCommand === 'Top')
      {
            if(this.getCurrentItem() !== undefined &&
              this.getCurrentItem()._parent !== undefined)
                this.getCurrentItem()._parent.ShowCurrentItems();
      }
      else if(this._currentCommand === 'Next')
        this.getCurrentItem().ShowNextItemPage();
      else if(this._currentCommand === 'Prev')
        this.getCurrentItem().ShowPrevItemPage();
      else{

        let tItem = this.getCurrentItem().findItem(this._currentCommand);
        if(tItem !== undefined && tItem.hasItems())
         tItem.ShowCurrentItems();
        else if(tItem !== undefined)
         tItem.setItemState();
      }
    }
    getRootItem(){
        let user = this.getCurrentUserObject();
        if(user)
            return user.rootItem;
    }
    getCurrentItem(){
        let user = this.getCurrentUserObject();
        if(user)
            return user.currentItem;
    }
    getCurrentUserObject(){
      let user = this._users.find(user => user.id == this._currentUser);
      if(!user)
        user = this.createNewUserObject();
      return user;
    }
    createNewUserObject(){
      let menuItem = this.createMenuItem(undefined,"Main",undefined);
      for(let i in myEnumList)
          this.buildSubItemsFromEnum(myEnumList[i],menuItem);
      let user = {
        userIDX  : this._userIDX++,
        id          :this._currentUser,
        rootItem    :menuItem,
        currentItem :menuItem,
      }
      this._users.push(user);
      return user;
    }
    onItemChange(item){
        let currentUserObj = this.getCurrentUserObject();
        if(currentUserObj)
            currentUserObj.currentItem = item;
    }
    buildSubItemsFromEnum(enumName,fatherItem){
    let allMembers = getEnums(enumName);
    if(allMembers !== undefined && allMembers.length > 0){
       let enumObject = getObject('enum.'+enumName);
       let name = MyUtility.getNameFromObj(enumObject.common);
       let menuItem = this.createMenuItem(fatherItem,name,undefined);
       fatherItem.addItem(menuItem);
       for(let i in allMembers)
       {
         let childItem  =   this.createMenuItem(menuItem ,MyUtility.getNameFromObj(allMembers[i]),allMembers[i].id);
         menuItem.addItem(childItem);
         if(allMembers[i].members)
         {
            allMembers[i].members.forEach(member =>
            {
              let tObject = getObject(member);
              if(tObject.type === 'device' ||
                 tObject.type === 'channel')
                {
                 let deviceItem = this.createMenuItem(childItem,MyUtility.getNameFromObj(tObject.common),member);
                 childItem.addItem(deviceItem);
                 let selector = $('state[id='+member+'.*][type=boolean]');
                 selector.each((id,i)=> {
                  let childObj = getObject(id);
                  let childItem =  this.createMenuItem(deviceItem,MyUtility.getNameFromObj(childObj.common),id);
                  deviceItem.addItem(childItem);
                 });
              }
              if(tObject.type ==='state')
              {
               let childSubItem =  this.createMenuItem(childItem,MyUtility.getNameFromObj(tObject.common),member);
               childItem.addItem(childSubItem);
              }
            });
          }
       }
    }
   }
   createMenuItem(parent,name,objectID){
       let item = new MenuItem(parent,name,objectID);
       item.on("onItemChange",this.onItemChange.bind(this));
    return item;
  }
}

let myEnumList =   ['functions','rooms'];
let telegramMenu = new MyTelegramMenu();
//let myEnumList = ['functions','rooms','obergeschoss'];
