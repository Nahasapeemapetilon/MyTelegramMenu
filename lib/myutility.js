
const Store = {
  JavaInstance:undefined,
  Localizer:require('./localization/localizer'),
  Options : {},
  NaviMap : {
            "Prev" :{SymbolAsUniCode : '\u21A9',
                     Command : '\u21A9',
                     Text : 'Prev'
            },
            "Top"  :{SymbolAsUniCode : '\u2934',
                     Command : '\u2934',
                     Text : 'Top'
                    },
            "Next" :{SymbolAsUniCode : '\u21AA',
                       Command : '\u21AA',
                       Text : 'Next'
                      },
            "Info" :{
                        SymbolAsUniCode : '\u2139',
                        Command : '\u2139',
                        Text   : 'Info'}
 },
  AllowedTypes : ["boolean","number","string"],
  StateNames : {
                TelegraphState  : "TelegraphToken",
                LastGoogleState : "LastGoogleCommand",
                ExecutedGoogleCommands: "ExecutedGoogleCommands",
                },
  Promise: undefined
};

module.exports = class MyUtility{
  constructor(){ }
  static getNameFromObj(obj){
    let objName = MyUtility.getTranslatedMsg("noName");
    if(obj)
    {
	     if(obj.hasOwnProperty('common'))
	      {
          const {common} = obj;
	         if(common.hasOwnProperty('name'))
	          objName = common.name;
	      }
        else if(obj.hasOwnProperty('name'))
        {
          const {name} = obj;
          if(name.hasOwnProperty(MyUtility.getOptions().locale))
            objName = name[MyUtility.getOptions().locale];
          else if(name === Object(name))
            objName = name[Object.keys(name)[0]];
          else
          {
            if(name instanceof String ||
              typeof name  === 'string')
             objName = name;
          }
        }
    }
    return objName;
  }
static getNaviMap()
{
  return Store.NaviMap;
}
static getInstance() {
  return Store.JavaInstance;
}

static setInstance(_JavaInstance){
    Store.JavaInstance = _JavaInstance;
  }
 static getLocalizer()
 {
   return Store.Localizer;
 }
 static setLocale(locale)
 {
   Store.Localizer.setLocale(locale);
 }
 static getTranslatedMsg(key)
 {
   return Store.Localizer.getTranslatedMsg(key);
 }
 static setOptions(options)
 {
   Store.Options = options;
 }
 static getOptions()
 {
   return Store.Options;
 }
 static defaultOptions(options){
   options = options || {};
   options.locale = options.locale || 'de';
   options.enumList =options.enumList || ['rooms'];
   options.telegramInstance = options.telegramInstance || 'telegram.0';
   options.feedbackToTelegram = options.feedbackToTelegram  || true;
   options.showRootItemsCommand = options.showRootItemsCommand || '/menue';
   if(!options.showRootItemsCommand.startsWith('/'))
    options.showRootItemsCommand = '/' + options.showRootItemsCommand;
   options.MenuRows  = options.MenuRows || 3;
   options.MenuCols  = options.MenuCols || 2;
   options.enableGooglePolling = options.enableGooglePolling || false;
   options.pollingInterval = options.pollingInterval || 750;
   options.googlePollingRestart = options.googlePollingRestart || true ;
   options.googleURL = options.googleURL || '';
   options.googleEnumList = options.googleEnumList || '';
   options.googleIgnoreEnumName = options.googleIgnoreEnumName || false;
   return options;
 }
 static getAllowedList(){
   return Store.AllowedTypes;
 }
 static isTypeAllowed(type)
 {
   let lowerType = "";
   if(type && (type instanceof String || typeof type ==='string'))
    lowerType = type.toLowerCase();
   const tListAllowed = MyUtility.getAllowedList()
   return tListAllowed.some((element)=> element === lowerType);
 }
 static getStateName(pWhat)
 {
   if(Store.StateNames.hasOwnProperty(pWhat))
    return Store.StateNames[pWhat];
   return undefined;
 }
 static sendMsgToTelegram(msg)
 {
   MyUtility.getInstance().sendTo(MyUtility.getOptions().telegramInstance, {
     chatId : MyUtility.getInstance().getState(MyUtility.getOptions().telegramInstance  + '.communicate.requestChatId').val,
     text:   msg });
 }
 static getIoBrokerFunctionsWithPromis(){
   const IoBrokerFunctionsWithPromise = require('./iobrokerfunctionswithpromise');
   if(Store.Promise == undefined){
        Store.Promise = new IoBrokerFunctionsWithPromise(MyUtility.getInstance());
  }
   return Store.Promise;
 }
}
