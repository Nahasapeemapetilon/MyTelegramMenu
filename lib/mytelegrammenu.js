const MenuItem = require('./menuitem');
const MyUtility = require('./myutility');
const MyParserNumber = require('./parsenumberfortelegram');
const StateObject = require('./stateobject');
const Report = require('./menuitemreport');
const GooglePolling = require('./googlepolling');

module.exports  = class MyTelegramMenu {
    constructor(javaInstance,options){
    options = MyUtility.defaultOptions(options);
    this._userIDX = 0;
    this._currentUser = '';
    this._currentMsg = '';
    this._currentCommand = '';
    this._users = [];
    this._myEnumList = options.enumList;
    this._naviMap = MyUtility.getNaviMap();
    this._googleRootItem = undefined;
    MyUtility.setOptions(options);
    MyUtility.setInstance(javaInstance);
    MyUtility.setLocale(options.locale);
    MyUtility.getInstance().on({id:options.telegramInstance+'.communicate.request',
      change: 'any'},this.onTelegramRequest.bind(this));
    if(options.enableGooglePolling && options.googleURL != '')
      {
        this._googlePolling = new GooglePolling();
        this._googlePolling.executePolling();
        this._googlePolling.on('newCommadInSheet',this.onGoogleRequest.bind(this));
        this._googleRootItem = createGoogleObject();
      }
    }

    createGoogleObject()
    {
      let myGoogleObjectList = [];
      for(let i in this._myEnumList){
        let tName = this._myEnumList[i];
        let tMembers = MyUtility.getInstance().getEnums(tName);
        if(tMembers == undefined && tMembers.length > 0){
          let enumObject = MyUtility.getInstance().getObject('enum.'+tName);
          if(enumObject){
          for(let b in tMembers){
              if(tMembers[b].members)
              {
                tMembers[i].members.forEach(member =>
                  {

                  });
              }
           }
          }
        }
      }
    }

    onGoogleRequest(){
      this.parseGoogleMsg();
      this.executeGoogleCommand();
    }

    parseGoogleMsg(){

    }

    executeGoogleCommand(){
     this._googlePolling.lastCommand;
     MyUtility.getInstance().console.log(["value :", this._googlePolling.lastCommand]);
    }

    onTelegramRequest(){
      this.parseTelegramMsg();
      this.executeCommand();
    }
    parseTelegramMsg(){
      this._currentMsg = MyUtility.getInstance().getState(MyUtility.getOptions().telegramInstance+ ".communicate.request").val;
      let tIdx = this._currentMsg.indexOf("]");
      this._currentUser =  this._currentMsg.substring(1,tIdx);
      this._currentCommand  = this._currentMsg.substring(tIdx+1,this._currentMsg.length);
    }
    executeCommand(){
    //  MyUtility.getInstance().log(this._currentCommand);
      if(this._currentCommand === MyUtility.getOptions().showRootItemsCommand)
        this.getRootItem().ShowCurrentItems();
      else if(this._currentCommand === this._naviMap['Top'].Command)
      {
            if(this.getCurrentItem() !== undefined &&
              this.getCurrentItem()._parent !== undefined)
                this.getCurrentItem()._parent.ShowCurrentItems();
      }
      else if(this._currentCommand ===  this._naviMap['Next'].Command)
        this.getCurrentItem().ShowNextItemPage();
      else if(this._currentCommand === this._naviMap['Prev'].Command)
        this.getCurrentItem().ShowPrevItemPage();
      else if(this._currentCommand == this._naviMap['Info'].Command)
      {
        const report = new Report(this.getCurrentItem());
        report.buildReport();
      }
      else{
        let tItem = this.getCurrentItem().findItem(this._currentCommand);
        if(tItem !== undefined && tItem.hasItems())
         tItem.ShowCurrentItems();
        else if(tItem !== undefined)
        {
          if(tItem.isObjectWriteable())
          {
            if(tItem.isCommonTypeABoolean())
              tItem.setItemStateValue();
            else if(tItem.isCommonTypeANumber())
              new MyParserNumber(tItem).execute();
          }
          else
            {
              if(tItem.isObjectTypeAState()){
               const name = tItem.Name;
               let state =tItem.getItemStateValue();
               const unit = tItem.getObjectUnit() || "";
               if(state != undefined)
               {
                 if(tItem.isCommonTypeABoolean)
                   state = state?MyUtility.getTranslatedMsg("on"):MyUtility.getTranslatedMsg("off");
                 MyUtility.sendMsgToTelegram(MyUtility.getTranslatedMsg('currentNumber') + `${state} ${unit} ${name}`);
                }
              }
            }
          }
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
