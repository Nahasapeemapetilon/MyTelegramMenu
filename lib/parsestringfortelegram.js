const MyUtility = require('./myutility');

module.exports = class ParseStringForTelegram
{
  constructor(item){
    this._item = item;
    this._subcription;
    this._resolve = undefined;
    this._reject = undefined;
  }
  execute(){
    const stateValue = this._item.getItemStateValue();
    //MyUtility.sendMsgToTelegram("Wert eingeben (String) Eingabe" + "\n" );
    MyUtility.sendMsgToTelegram(MyUtility.getTranslatedMsg("InputText") + "\n");
    const myPromise = new Promise(this.promiseExecute.bind(this));
    myPromise.then(this.done.bind(this)).catch(this.failToParseString.bind(this));
  }

  done(fulfilled){
    if(this._item)
    {
        this._item.setItemStateValue(fulfilled);
    }
  }

  failToParseString(error){
    MyUtility.sendMsgToTelegram(MyUtility.getTranslatedMsg("ErrorTextInput"));
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
        if(this._resolve)
          this._resolve(value);
    }
    else
     {
      if (this._reject)
        this._reject(new Error(MyUtility.getTranslatedMsg("ErrorTextInput")));
      }
    }

}
