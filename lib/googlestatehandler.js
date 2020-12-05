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
      const tMatchedMembers = this._states.reduce((acc,item) =>{
        acc.push(item.members.filter((pState)=>pState.getObjectName().toLowerCase() === pStateName.toLowerCase()));},[]);
    else
    {
     const tMatchesGroup = this._states.find((Obj)=>Obj.Name.toLowerCase() === pGroupName.toLowerCase());
     if(tMatchesGroup)
       return tMatchesGroup.Members.filter((pState) => pState.getObjectName().toLowerCase() === pStateName.toLowerCase());
    }
    return [];
  }
}
