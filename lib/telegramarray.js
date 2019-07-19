const MyUtility = require('./myutility');

module.exports = class TelegramArray{
  constructor(menuItem){
    this._menuItem = menuItem;
    this._iRowLength = MyUtility.getOptions().MenuRows;
    this._iColLength = MyUtility.getOptions().MenuCols;
    this._needUpdate = true;
    this._telegramArray = undefined;
    this._standardNavigationMenu = undefined;
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
    if(this.length > 0 && idx < this.length)
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
        pageList.push(this.getStandardNaviMenuAsArray());
        pagesList.push(pageList);
        pageList =[];
      }
    }
    if(internNamesList.length > 0 )
    {
     pageList.push(internNamesList);
     pageList.push(this.getStandardNaviMenuAsArray());
     pagesList.push(pageList);
    }
    this._telegramArray = pagesList;
    this._needUpdate = false;
  }
  getStandardNaviMenuAsArray()
  {
    if(this._standardNavigationMenu == undefined)
    {
      const naviMap = MyUtility.getNaviMap();
      this._standardNavigationMenu = [];
        for(let key in naviMap)
          this._standardNavigationMenu.push(naviMap[key].SymbolAsUniCode);
    }
    return this._standardNavigationMenu;
  }
}
