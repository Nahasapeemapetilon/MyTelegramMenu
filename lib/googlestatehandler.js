const MyUtility = require('./myutility');
const StateObject = require('./stateobject');

module.exports = class GoogleStateHandler{
  constructor(){
    this._states = [];
    this._googleEnumList = MyUtility.getOptions().googleEnumList;
    this.initializeAllStates();
  }

  initializeAllStates(){
    this._states = this._googleEnumList.map((pName)=> MyUtility.getInstance().getEnums(pName));
    this._states = this._states.filter((tList) => tList !== undefined && tList.length > 0);
    this._states = this._states.reduce((acc,item) =>{
      return item.reduce((acc,item)=>{
              if(item.members){
                const name = MyUtility.getNameFromObj(item);
                   acc.push({Name : name,
                             Members : item.members.reduce((acc,item)=>{
                       const stateObject = new StateObject(item);
                        if(stateObject.isObjectTypeAState()){
                          if(MyUtility.isTypeAllowed(stateObject.getCommonType())){
                            acc.push(stateObject)
                          }
                        }
                      return acc;
                  },[])});
              }
              return acc;
          },acc);
      },[]);
  }


  findState(pGroupName,pStateName){
    if(MyUtility.getOptions().googleIgnoreEnumName)
    {
      try{
      const tReducedList = this._states.reduce((acc, item) => {
      const toAdd = item.Members.filter((pState) => pState.getObjectName().toLowerCase() === pStateName.toLowerCase());
      if (toAdd.length > 0)
        acc.push(...toAdd);
      return acc;
    }, []);
    const tUniqueList = tReducedList.reduce((acc, item) => {
      const tSome = acc.some((pSome) => pSome._objectID === item._objectID);
      if (!tSome)
        acc.push(item);
      return acc;
    }, []);
    return tUniqueList;
    }
    catch (Error) {
      return [];
    }
    }
    else
    {
     const tMatchesGroup = this._states.find((Obj)=>Obj.Name.toLowerCase() === pGroupName.toLowerCase());
     if(tMatchesGroup)
       return tMatchesGroup.Members.filter((pState) => pState.getObjectName().toLowerCase() === pStateName.toLowerCase());
    }
    return [];
  }
}
