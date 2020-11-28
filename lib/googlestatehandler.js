const MyUtility = require('./myutility');
const StateObject = require('./stateobject');

module.exports = class GoogleStateHandler{
  constructor(){
    this._states = [];
    this._googleEnumList = MyUtility.getOptions().googleEnumList;
    this.initializeAllStates();
  }
  initializeAllStates(){
      this._states = this._googleEnumList.map((pName)=>{
        let tNewList = [];
        const tMembers = MyUtility.getInstance().getEnums(pName);
        if(tMembers !== undefined && tMembers.length > 0){
            let enumObject =MyUtility.getInstance().getObject('enum.'+pName);
            if(enumObject){
              tMembers.forEach((tMember)=>{
                if(tMember.members){
                  tMember.members.forEach((item, i) => {
                    const stateObject = new StateObject(item);
                    if(stateObject.isObjectTypeAState()){
                     if(MyUtility.isTypeAllowed(stateObject.getCommonType())){
                      tNewList.push(stateObject);
                     }
                    }
                  });
                }
              });
            }
          }
          return tNewList;
        }
      );
  }

  findState(pName){
    
  }
}
