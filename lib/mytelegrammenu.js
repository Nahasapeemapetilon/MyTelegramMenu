const MenuItem = require('./menuitem');
const MyUtility = require('./myutility');
const MyParserNumber = require('./parsenumberfortelegram');

module.exports  = class MyTelegramMenu {
    constructor(javaInstance,options){
    options = this.defaultOptions(options);
    this._userIDX = 0;
    this._currentUser = '';
    this._currentMsg = '';
    this._currentCommand = '';
    this._users = [];
    this._myEnumList = options.enumList;
    this._naviMap = MyUtility.getNaviMap();
    MyUtility.setOptions(options);
    MyUtility.setInstance(javaInstance);
    MyUtility.setLocale(options.locale);
    MyUtility.getInstance().on({id:options.telegramInstance+'.communicate.request',
      change: 'any'},this.onTelegramRequest.bind(this));
    }
     defaultOptions(options)
    {
       options = options || {};
       options.locale = options.locale || 'de';
       options.enumList =options.enumList || ['rooms'];
       options.telegramInstance = options.telegramInstance || 'telegram.0';
       options.feedbackToTelegram = options.feedbackToTelegram  || true;
       options.MenuRows  = options.MenuRows || 3;
       options.MenuCols  = options.MenuCols || 2;
       return options;
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
      if(this._currentCommand === '/menue')
        this.getRootItem().ShowCurrentItems();
      else if(this._currentCommand === this._naviMap['Top'])
      {
            if(this.getCurrentItem() !== undefined &&
              this.getCurrentItem()._parent !== undefined)
                this.getCurrentItem()._parent.ShowCurrentItems();
      }
      else if(this._currentCommand ===  this._naviMap['Next'])
        this.getCurrentItem().ShowNextItemPage();
      else if(this._currentCommand === this._naviMap['Prev'])
        this.getCurrentItem().ShowPrevItemPage();
      else{
        let tItem = this.getCurrentItem().findItem(this._currentCommand);
        if(tItem !== undefined && tItem.hasItems())
         tItem.ShowCurrentItems();
        else if(tItem !== undefined)
        {
          if(tItem.isObjectWriteable())
          {
            if(tItem.isCommonTypeABoolean())
              tItem.setItemState();
            else if(tItem.isCommonTypeANumber())
              new MyParserNumber(tItem).execute();
          }
          else
            {
              if(tItem.isObjectTypeAState()){
               const name = tItem.Name;
               const state =tItem.getItemState();
               const unit = tItem.getObjectUnit() || "";
               if(state)
                MyUtility.sendMsgToTelegram(MyUtility.getTranslatedMsg('currentNumber') + `${state} ${unit} ${name}`);
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
              let tObject = MyUtility.getInstance().getObject(member);
              if(tObject)
              {
                if(tObject.type === 'device' ||
                   tObject.type === 'channel')
                  {
                   let deviceItem = this.createMenuItem(childItem,MyUtility.getNameFromObj(tObject.common),member);
                   childItem.addItem(deviceItem);
                   let selector = MyUtility.getInstance().$('state[id='+member+'.*]');
                   selector.each((id,i)=> {
                    let childObj = MyUtility.getInstance().getObject(id);
                    const { common: { type: typeOfCommon } } = childObj;
                    if(typeOfCommon && MyUtility.isTypeAllowed(typeOfCommon))
                    {
                      let childItem =  this.createMenuItem(deviceItem,MyUtility.getNameFromObj(childObj.common),id);
                      deviceItem.addItem(childItem);
                    }
                   });
                }
                if(tObject.type ==='state')
                {
                 const { common: { type: typeOfCommon } } = tObject;
                 if(typeOfCommon && MyUtility.isTypeAllowed(typeOfCommon)){
                  let childSubItem =  this.createMenuItem(childItem,MyUtility.getNameFromObj(tObject.common),member);
                  childItem.addItem(childSubItem);
                 }
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
