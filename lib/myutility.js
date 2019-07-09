const Store = {
  JavaInstance:undefined,
  Localizer:require('./localization/localizer'),
  Options : {},
  NaviMap : {
              "Next" :'\u21AA',
              "Prev" :'\u21A9',
              "Top"  :'\u2934'},
  AllowedTypes : ["boolean","number"]
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
 static sendMsgToTelegram(msg)
 {
   MyUtility.getInstance().sendTo(MyUtility.getOptions().telegramInstance, {
     chatId : MyUtility.getInstance().getState(MyUtility.getOptions().telegramInstance  + '.communicate.requestChatId').val,
     text:   msg });
 }
}
