const JavaInstance ={Java:undefined};
const NaviMap = {
  "Next" :'\u21AA',
  "Prev" :'\u21A9',
  "Top"  :'\u2934'
};
module.exports = class MyUtility{
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
static getNaviMap()
{
  return NaviMap;
}
static getInstance() {
  return JavaInstance.Java;
}

static setInstance(_JavaInstance){
  if(!JavaInstance.Java)
{
    JavaInstance.Java = _JavaInstance;
}
  else
    _JavaInstance.log("Achtung wurde schon gesetzt!");
  }
}
