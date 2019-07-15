const MyUtility = require('./myutility');

module.exports = class ParseNumberForTelegram{
  constructor(item){
    this._item = item;
    this._subcription;
    this._resolve = undefined;
    this._reject = undefined;
  }
  execute(){
    const stateValue = this._item.getItemStateValue();
    const unitValue =  this._item.getObjectUnit() || "";
    MyUtility.sendMsgToTelegram(MyUtility.getTranslatedMsg("InputNumber") + "\n" +
      MyUtility.getTranslatedMsg("currentNumber") + ` ${stateValue}  ${unitValue}`);
    const myPromise = new Promise(this.promiseExecute.bind(this));
    myPromise.then(this.done.bind(this));
    myPromise.catch(this.failToParseInt.bind(this))
  }

  done(fulfilled){
    if(this._item)
    {
      const max = this._item.getMaxValue()
      const min = this._item.getMinValue();
      if(fulfilled >= min && fulfilled <= max)
        this._item.setItemStateValue(fulfilled);
      else
        MyUtility.sendMsgToTelegram(MyUtility.getTranslatedMsg("MinMaxError") + " "+
                 MyUtility.getTranslatedMsg("min") + min +" " +
                 MyUtility.getTranslatedMsg("max") + max );
    }
  }

  failToParseInt(error){
    MyUtility.sendMsgToTelegram(MyUtility.getTranslatedMsg("WrongInput"));
  }
  promiseExecute(resolve,reject)
  {
    this._resolve = resolve;
    this._reject = reject;
    this._subcription =
      MyUtility.getInstance().on({id:MyUtility.getOptions().telegramInstance + '.communicate.request', change: 'any'},this.parseMessage.bind(this));
  }

  parseMessage(){
    if(this._subcription)
      MyUtility.getInstance().unsubscribe(this._subcription);
    const msg = MyUtility.getInstance().getState(MyUtility.getOptions().telegramInstance+ ".communicate.request").val;
    let tIdx = msg.indexOf("]");
    const value = msg.substring(tIdx+1,msg.length);
    if(value)
    {
      let  myNumber = parseInt(value);
      if(typeof myNumber == "number" && !isNaN(myNumber) )
      {
        if(this._resolve)
          this._resolve(myNumber);
      }
      else {
      if (this._reject)
        this._reject(new Error(MyUtility.getTranslatedMsg("WrongInput")));
      }
    }
  }
}
