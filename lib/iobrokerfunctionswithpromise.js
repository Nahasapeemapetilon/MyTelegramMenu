module.exports =  class IoBrokerFunctionsWithPromise
{
  constructor(pInstance){
    this.createState = this.createPromiseWithoutReject(pInstance.createState);
    this.setState = this.createPromiseWithoutReject(pInstance.setState);
  }
  createPromiseWithoutReject(fn)
  {
    return (...args) => new Promise((resolve,reject)=>{
      fn(...args,(error,value)=>{
        if(error)
          resolve(error);
        else
          resolve(value)});
    });
  }

}
