let MenuItem = function(parent,name,objectID){
    this.parent = parent;
    this.items = [];
    this.itemName = name;
    this.objectID = objectID;
    this.currentIDX = 0;
    this.telegramArray = undefined;
    this.arrayNeedUpdate = true;
}
MenuItem.prototype.addItem = function(item){
    if(item instanceof MenuItem)
    {
        this.items.push(item);
        this.arrayNeedUpdate = true;
    }
}
MenuItem.prototype.removeItem = function(item)
{
    this.items = this.items.filter(currentItem => currentItem !==item);
    this.arrayNeedUpdate = true;
}
MenuItem.prototype.hasItems =  function()
{
    return this.items.length > 0;
}
MenuItem.prototype.getItemAt = function(i)
{
    if(i>=0 && i< this.items.length)
        return this.items[i];
    return null;
}
MenuItem.prototype.findItem = function(what)
{
    if(this.hasItems())
    {
        let found = this.items.find(item  => {return item.getName() == what});
        return found;
    }
    return undefined;
}

MenuItem.prototype.setItemState = function(state)
{
    //log("setItemState"+ String(this.objectID))
    if(this.hasItems())
        this.items.forEach(item =>{ item.setItemState(state);});
    else
        {
         if(this.objectID)
         {
         let tObject= getObject(this.objectID);
         //log("object:" + JSON.stringify(tObject)        )
         if(tObject!== undefined)
         {
         //    console.log(tObject.type + ' '+  this.objectID);
             if(tObject.type === "state")
                {
                 //log(getState(this.objectID).val);
                 setState(this.objectID,!getState(this.objectID).val);
                 //log(getState(this.objectID).val);
                }
         }
       //  log("done");
         }
        }
}
MenuItem.prototype.getName = function()
{
    return this.itemName;
}

MenuItem.prototype.generateArrayForTelegram = function()
{
    if(!this.arrayNeedUpdate)
        return;
    let iRowLength = 3; // Anzahl Knöpfe nebeneinander
    let iColLength = 2; // Zeilen Knöpfe
    let iPageItemsSize = iRowLength*iColLength;
    let pagesList = [];
    let pageList = [];
    let internNamesList = [];

    for(let iCurrent = 0; iCurrent< this.items.length;iCurrent++)
    {
      let currentItem = this.items[iCurrent];

      if(iCurrent% iRowLength == 0 &&
         internNamesList.length > 0)
      {
        pageList.push(internNamesList);
        internNamesList = [];
      }
      internNamesList.push(currentItem.getName());

      if(iCurrent % iPageItemsSize == 0 &&
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
    this.telegramArray = pagesList;
    this.arrayNeedUpdate = false;
}

MenuItem.prototype.ShowNextPage = function()
{
    this.currentIDX++;
    if(this.currentIDX >= this.telegramArray.length)
      this.currentIDX = 0;
    this.showButtons();
}

MenuItem.prototype.ShowPrevPage = function()
{
    this.currentIDX--;
    if(this.currentIDX <0)
        this.currentIDX = this.telegramArray.length-1;
    this.showButtons();
}

MenuItem.prototype.getTelegramMenu = function()
{
    if(this.arrayNeedUpdate ||
       this.telegramArray === undefined)
       this.generateArrayForTelegram();

   if(this.telegramArray.length > 0 &&
     this.currentIDX < this.telegramArray.length)
    return this.telegramArray[this.currentIDX];
   return [];
}

MenuItem.prototype.showButtons = function()
{
     sendTo('telegram.0', {
        text:   'Bitte Raum wählen:',
        reply_markup: {
            keyboard:
                this.getTelegramMenu()
            ,
            resize_keyboard:   true,
            one_time_keyboard: true

        }
    });
    menuEvents.emit('menuItemChange',this);
}
let menuEvents = new (require('events').EventEmitter)();

let MyTelegramMenu = function(){
    this.currentUser = '';
    this.rootItem = this.createMenuItem(undefined,"Main",undefined);
    this.currentItem = this.rootItem;
    menuEvents.on('menuItemChange',this.onItemChange.bind(this));
    for(let i in myEnumList)
        this.addEnums(myEnumList[i]);
    this.rootItem.showButtons();
}

MyTelegramMenu.prototype.addEnums = function(enumName)
{
 let allMembers = getEnums(enumName);
 if(allMembers !== undefined && allMembers.length > 0)
 {
     let enumObject = getObject('enum.'+enumName);
    //log(JSON.stringify(enumObject));
     let name = getNameFromObj(enumObject.common);
    //  if(enumObject.common.name.de !== undefined)
    //     name = enumObject.common.name.de;
    //  else
    //     name = enumObject.common.name;
    // log("name:" + name);
     let menuItem = this.createMenuItem(this.rootItem,name,undefined);
     this.rootItem.addItem(menuItem);
    for(let i in allMembers)
    {
        let newItem  =   this.createMenuItem(menuItem ,getNameFromObj(allMembers[i]),allMembers[i].id);
        menuItem.addItem(newItem);

        if(allMembers[i].members)
        {
            allMembers[i].members.forEach(member => {
            let tObject = getObject(member);
           if(tObject.type === 'device' ||
              tObject.type === 'channel')
           {
               let deviceItem = this.createMenuItem(newItem,getNameFromObj(tObject.common),member);
               newItem.addItem(deviceItem);
               let selector = $('state[id='+member+'.*][type=boolean]');
               selector.each((id,i)=> {
               let childObj = getObject(id);
               let childItem =  this.createMenuItem(deviceItem,getNameFromObj(childObj.common),id);
               deviceItem.addItem(childItem);
               });
           }

            if(tObject.type ==='state')
            {
             let childItem =  this.createMenuItem(newItem,getNameFromObj(tObject.common),member);
             newItem.addItem(childItem);
            }
           });
        }
    }
 }
}

MyTelegramMenu.prototype.onItemChange = function(newMenuItem)
{
    this.currentItem = newMenuItem;
}


MyTelegramMenu.prototype.onTelegramRequest = function()
{
    let currentMsg = getState("telegram.0.communicate.request").val;
    let tIdx = currentMsg.indexOf("]");
    let currentUser =  currentMsg.substring(1,tIdx);
    let currentCommand  =   currentMsg.substring(tIdx+1,currentMsg.length);
 //   log("currentCommand : "+ currentCommand);
    if(currentCommand === '/menue')
    {
        this.rootItem.showButtons();
    }
    else if(currentCommand === 'Top')
    {
        if(this.currentItem !== undefined &&
          this.currentItem.parent !== undefined)
            this.currentItem.parent.showButtons();
    }
    else if(currentCommand === 'Next')
      this.currentItem.ShowNextPage();
    else if(currentCommand === 'Prev')
            {
               this.currentItem.ShowPrevPage();
            }
    else
    {
       let tItem = this.currentItem.findItem(currentCommand);
       if(tItem !== undefined && tItem.hasItems())
           tItem.showButtons();
       else if(tItem !== undefined)
        tItem.setItemState();
    }
}

MyTelegramMenu.prototype.getRootItem = function()
{
    return this.rootItem;
}

MyTelegramMenu.prototype.getCurrentItem = function()
{
    return this.currentItem;
}

MyTelegramMenu.prototype.createMenuItem = function(parent,name,objectID)
{
    var item = new MenuItem(parent,name,objectID);
    return item;
}

let getNameFromObj= function(obj)
{
    let name = '';
    if(obj)
    {
        if(obj.name.de)
         name = obj.name.de;
        else if(obj.name)
          name = obj.name;
    }
    //og("name is = :" + String(name));
    return name;
}
let myEnumList = ['functions','rooms'];
//let myEnumList = ['functions','rooms','obergeschoss'];
let telegramMenu = new MyTelegramMenu();
on({id:'telegram.0.communicate.request', change: 'any'},telegramMenu.onTelegramRequest.bind(telegramMenu));
