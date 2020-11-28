const MenuItem = require('./menuitem');
const MyUtility = require('./myutility');
const MyParserNumber = require('./parsenumberfortelegram');
const StateObject = require('./stateobject');
const Report = require('./menuitemreport');
const GooglePolling = require('./googlepolling');
const MyTelegramMenuCommand = require('./mytelegrammenucommand');
const GooglePollingCommand = require('./googlepollingcommand');


module.exports  = class MyTelegramMenu {
    constructor(javaInstance,options){
    options = MyUtility.defaultOptions(options);
    this._userIDX = 0;
    this._currentUser = '';
    this._users = [];
    this._myEnumList = options.enumList;
    this._googleRootItem = undefined;
    MyUtility.setOptions(options);
    MyUtility.setInstance(javaInstance);
    MyUtility.setLocale(options.locale);
    this._TelegramMenuCommand = new MyTelegramMenuCommand(this);

    MyUtility.getInstance().on({id:options.telegramInstance+'.communicate.request',
          change: 'any'},this._TelegramMenuCommand.onRequest.bind(this._TelegramMenuCommand));

    if(options.enableGooglePolling && options.googleURL != '')
      {
        this._googlePolling = new GooglePolling();
        this._googlePollingCommand = new GooglePollingCommand();
        this._googlePolling.executePolling();
        this._googlePolling.on('newCommadInSheet',this._googlePollingCommand.onRequest.bind(this._googlePollingCommand));      
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
    ShowRootItems(){
      this.getRootItem().ShowCurrentItems();
    }
    ShowTopItem()
    {
      if(this.getCurrentItem() !== undefined &&
        this.getCurrentItem()._parent !== undefined)
          this.getCurrentItem()._parent.ShowCurrentItems();
    }
    ShowNextItem(){
      this.getCurrentItem().ShowNextItemPage();
    }
    ShowPrevItem(){
      this.getCurrentItem().ShowPrevItemPage();
    }
    ShowItem(pItem){
      if(pItem !== undefined && pItem.hasItems())
        pItem.ShowCurrentItems();
    }
    GetItemBy(pName){
      let tItem = this.getCurrentItem();
      if(tItem)
        return tItem.findItem(pName);
      return undefined;
    }
    BuildReport(){
      const report = new Report(this.getCurrentItem());
      report.buildReport();
    }
    SetItemStateValue(pItem){
      if(pItem.isObjectWriteable())
      {
        if(pItem.isCommonTypeABoolean())
          pItem.setItemStateValue();
        else if(pItem.isCommonTypeANumber())
          new MyParserNumber(pItem).execute();
      }
    }
    SendItemValueToTelegram(pItem)
    {
      if(pItem === undefined)
        return;
      if(pItem.isObjectTypeAState()){
       const name = pItem.Name;
       let state =pItem.getItemStateValue();
       const unit = pItem.getObjectUnit() || "";
       if(state != undefined)
       {
         if(pItem.isCommonTypeABoolean())
           state = state?MyUtility.getTranslatedMsg("on"):MyUtility.getTranslatedMsg("off");
         MyUtility.sendMsgToTelegram(MyUtility.getTranslatedMsg('currentNumber') + `${state} ${unit}`);
        }
      }
    }
    setCurrentUser(pUser)
    {
      this._currentUser = pUser;
    }
    createNewUserObject(){
      let menuItem = this.createMenuItem(undefined,"Main",undefined);
      for(let i in this._myEnumList)
          this.buildSubItemsFromEnum(this._myEnumList[i],menuItem);
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
    let allMembers = MyUtility.getInstance().getEnums(enumName);
    if(allMembers !== undefined && allMembers.length > 0){
       let enumObject = MyUtility.getInstance().getObject('enum.'+enumName);
       if(!enumObject)
       {
		       MyUtility.getInstance().log(MyUtility.getTranslatedMsg("enumError") + enumName);
		       return;
       }
       let name = MyUtility.getNameFromObj(enumObject.common);
       let menuItem = this.createMenuItem(fatherItem,name,enumObject._id);
       fatherItem.addItem(menuItem);
       for(let i in allMembers)
       {
         let childItem  =   this.createMenuItem(menuItem ,MyUtility.getNameFromObj(allMembers[i]),allMembers[i].id);
         menuItem.addItem(childItem);
         if(allMembers[i].members)
         {
            allMembers[i].members.forEach(member =>
            {
              const stateObject = new StateObject(member);
              if(stateObject.isObjectTypeADeviceOrChannel()){
                let deviceItem = this.createMenuItem(childItem,MyUtility.getNameFromObj(stateObject.getCommonObject()),member);
                childItem.addItem(deviceItem);
                let selector = MyUtility.getInstance().$('state[id='+member+'.*]');
                selector.each((id,i)=> {
                  const stateChildObj = new StateObject(id);
                  if(MyUtility.isTypeAllowed(stateChildObj.getCommonType()))
                  {
                    let childItem =  this.createMenuItem(deviceItem,MyUtility.getNameFromObj(stateChildObj.getCommonObject()),id);
                    deviceItem.addItem(childItem);
                  }});
              }
              if(stateObject.isObjectTypeAState()){
               if(MyUtility.isTypeAllowed(stateObject.getCommonType())){
                let childSubItem =  this.createMenuItem(childItem,MyUtility.getNameFromObj(stateObject.getCommonObject()),member);
                childItem.addItem(childSubItem);
               }
              }
            });
          }
       }
    }
   }
   createMenuItem(parent,name,objectID){
      let nameWidthIdx;
       if(parent)
          nameWidthIdx =`(${parent.itemLength +1}) ${name}`;
       else
          nameWidthIdx = name;

       let item = new MenuItem(parent,nameWidthIdx,objectID);
       item.on("onItemChange",this.onItemChange.bind(this));
    return item;
  }
}
