const JavaInstance ={Java:undefined};
const NaviMap = {
  "Next" :'\u21AA',
  "Prev" :'\u21A9',
  "Top"  :'\u2934'
};
module.exports = class MyUtility{
  constructor(){}
  static getNameFromObj(obj){
    let objName = '';
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
          if(name.hasOwnProperty('de'))
            objName = name.de;
          else
            objName = name;
        }
    }
    return objName;
  }
static getNaviMap()
{
  return NaviMap;
}
static getInstance() {
  return JavaInstance.Java;
}

static setInstance(_JavaInstance){
    JavaInstance.Java = _JavaInstance;
  }
}
