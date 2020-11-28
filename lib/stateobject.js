const MyUtility = require('./myutility');
module.exports = class StateObject{
  constructor(objectID){
    this._objectID = objectID;
    this._object = undefined;
    this._objectType = undefined;
    this._commonType = undefined;
    this._objectUnit = undefined;
    this._hasMinValue = undefined;
    this._hasMaxValue = undefined;
    this._min = undefined;
    this._max = undefined;
    this._objectRole = undefined;
    this._writeable = undefined;
    this._Name = undefined;
  }

  getObjectID(){
    return this._objectID;
  }

  getObject(){
    if(this._object == undefined){
      if(this._objectID)
        this._object = MyUtility.getInstance().getObject(this._objectID);
    }
    return this._object;
  }

  getCommonObject(){
    const object = this.getObject();
    const {common} = object;
    return common;
  }

  getObjectName(){
    if(this._Name == undefined)
      this._Name = MyUtility.getNameFromObj(getCommonObject())
    return this._Name;
  }

  getObjectValue()
  {
    if(this._objectID)
      return MyUtility.getInstance().getState(this._objectID).val;
    return undefined;
  }

  getObjectType(){
    if(this._objectType == undefined)
    {
      const tObject = this.getObject();
      this._objectType = '';
      if(tObject)
      {
        const {type:objectType} = tObject;
        if(objectType)
          this._objectType = objectType;
      }
    }
    return this._objectType;
  }

  getCommonType()
  {
    if(this._commonType == undefined)
    {
      const tObject = this.getObject()
      this._commonType = '';
      if(this.isObjectTypeAState())
      {
          const { common: { type: typeOfCommon } } = tObject;
          if(typeOfCommon)
            this._commonType = typeOfCommon;
      }
    }
    return this._commonType;
  }

  getObjectRole()
  {
    if(!this._objectRole)
    {
      const tObject = this.getObject()
      if(tObject)
      {
          this._objectRole = '';
          const { common: { role: roleOfCommon } } = tObject;
          if(roleOfCommon)
            this._objectRole = roleOfCommon;
      }
    }
    return this._objectRole;
  }

  getObjectUnit()
  {
    if(this._objectUnit == undefined)
    {
        let tObject = this.getObject()
        this._objectUnit = '';
        if(tObject)
        {
          const { common: { unit: unitOfCommon } } = tObject;
          if(unitOfCommon)
            this._objectUnit =  unitOfCommon;
        }
    }
    return this._objectUnit;
  }
  hasMinValue(){
    if(this._hasMinValue == undefined && this._min == undefined)
      this.initializeMinValue();
    return this._hasMinValue;
  }
  initializeMinValue(){
    let tObject = this.getObject()
    if(tObject)
    {
      this._min = 0;
      const { common: { min: minOfCommon } } = tObject;
      if(minOfCommon !== null && minOfCommon !== undefined){
        this._min = minOfCommon;
        this._hasMinValue = true;
        return;
      }
    }
    this._hasMinValue = false;
  }
  getMinValue(){
    if(this._min == undefined && this._hasMinValue == undefined)
        this.initializeMinValue();
    return this._min;
  }
  hasMaxValue(){
    if(this._max == undefined && this._hasMaxValue == undefined)
      this.initializeMaxValue();
    return this._hasMaxValue;
  }
  initializeMaxValue(){
    let tObject = this.getObject()
    this._max = 100;
    if(tObject)
    {
      const { common: { max: maxOfCommon } } = tObject;
      if(maxOfCommon !== null && maxOfCommon !== undefined){
        this._max = maxOfCommon;
        this._hasMaxValue = true;
        return;
      }
    }
    this._hasMaxValue = false;
  }
  getMaxValue(){
    if(this._max == undefined && this._hasMaxValue == undefined)
      this.initializeMaxValue();
    return this._max;
  }

  isWriteable()
  {
    if(this._writeable == undefined)
    {
      let tObject = this.getObject()
      this._writeable = false;
      if(tObject)
      {
          const { common: { write: writeAble } } = tObject;
          if(writeAble != undefined)
            this._writeable =  writeAble;
      }
    }
      return this._writeable;
  }

  isObjectTypeA(input)
  {
      const objectType = this.getObjectType();
      return objectType.indexOf(input) !== -1;
  }

  isObjectTypeAState()
  {
    return this.isObjectTypeA('state');
  }

  isObjectRoleA(input)
  {
    const objectRole = this.getObjectRole();
    return objectRole.indexOf(input) !== -1;
  }

  isObjectAButton()
  {
    return this.isObjectRoleA('button')
  }
  isObjectASwitch()
  {
    return this.isObjectRoleA('switch')
  }

  isObjectTypeAEnum(){
    return this.isObjectTypeA('enum');
  }

  isObjectTypeADeviceOrChannel()
  {
    const objectType = this.getObjectType();
    const tListAllowed = ['device','channel'];
    return tListAllowed.some((element)=> element === objectType);
  }

  isCommonTypeANumber()
  {
    const objectType = this.getCommonType();
    return objectType === 'number';
  }

  isCommonTypeABoolean()
  {
    const objectType = this.getCommonType();
    return objectType === 'boolean';
  }
}
