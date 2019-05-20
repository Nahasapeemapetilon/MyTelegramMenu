const JavaInstance ={Java:undefined};
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
