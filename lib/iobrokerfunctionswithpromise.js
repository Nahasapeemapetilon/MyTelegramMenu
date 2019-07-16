const MyUtility = require('./myutility');
class IoBrokerFunctionsWithPromise{
  constructor(){
    this.createState = this.createPromiseWithoutReject(MyUtility.getInstance().createState);
    this.setState = this.createPromiseWithoutReject(MyUtility.getInstance().setState);
  }
  createPromiseWithoutReject(fn){
    return (...args) => new Promise((resolve,reject)=>{
      fn(...args,(error,value)=>resolve(value));
    });
  }

}
module.exports = new IoBrokerFunctionsWithPromise();
