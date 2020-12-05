const https = require('https');
const EventEmitter = require('events');
const MyUtility = require('./myutility');

module.exports = class GooglePolling extends EventEmitter
 {
   constructor()
   {
     super();
     this._timeout = undefined;
     this._pollingInterval = MyUtility.getOptions().pollingInterval;
     this._pollingAbort = false;
     this._url = MyUtility.getOptions().googleURL;
     this._dataFromSheetAsJson;
     this._commandsInSheet = 0;
     this._lastExecutedCommand = 0;
     this._lastCommand = '';
     this.createGoogleStates();
   }
   get lastCommand(){
     return this._lastCommand;
   }
   get dataFromSheetAsJson(){
     return this._dataFromSheetAsJson;
   }

   set dataFromSheetAsJson(pInput) {
     try {
       if (pInput) {
         this._dataFromSheetAsJson = JSON.parse(pInput);

         const {   feed:{ entry : tEntries} } = this._dataFromSheetAsJson;
         //console.log(tEntries);
         if(tEntries){
          this._commandsInSheet = tEntries.length;
          const {gsx$meldung1: {$t : tLastCommand} } = tEntries[this._commandsInSheet-1];
          if(tLastCommand)
            this._lastCommand = tLastCommand;
         }
       }
     } catch (error) {
       MyUtility.getInstance().console.log(error);
       this._dataFromSheetAsJson = "";
     }
   }
   async setGoogleStates(){
     await MyUtility.getIoBrokerFunctionsWithPromis().setState( MyUtility.getStateName("ExecutedGoogleCommands"),this._lastExecutedCommand,true);
     await MyUtility.getIoBrokerFunctionsWithPromis().setState( MyUtility.getStateName("LastGoogleState"),this._lastCommand,true);
   }
   createGoogleStates(){
     this.createExecutedCommandsState();
     this.createLastCommandState();
   }
   async createLastCommandState(){
        const tStateName =  MyUtility.getStateName("LastGoogleState");
         if(!MyUtility.getInstance().existsState(tStateName)){
           await MyUtility.getIoBrokerFunctionsWithPromis().createState(tStateName , "",
                                   {
                                    read: true,
                                    write: true,
                                    desc: "Token for telegra.ph",
                                    type: "string",
                                    def: "",
                                    ack :false});
         }
   }
   async createExecutedCommandsState()
   {
   const tStateName =  MyUtility.getStateName("ExecutedGoogleCommands");
   if(!MyUtility.getInstance().existsState(tStateName)){
    await MyUtility.getIoBrokerFunctionsWithPromis().createState(tStateName,0,
                                                                  {
                                                                    read: true,
                                                                    write: true,
                                                                    desc: "executed Commands with google",
                                                                    type: "number",
                                                                    def: 0,
                                                                    value :0,
                                                                    role:   'value',
                                                                    ack : false
                                                                  });
     }
     this._lastExecutedCommand = MyUtility.getInstance().getState(tStateName).val;
   }

   updateDataFromSheet(){
     return new Promise((resolve,reject)=>{
       let myGet = https.get(this._url, (myGet) =>
       {
         let tBody ="";
         myGet.on('data', data => tBody += data);
         myGet.on('error', err => reject(err));
         myGet.on('end', () => {
             resolve(tBody);
         });
       });
       myGet.on('error', (err) =>{reject(err);});
       myGet.end();
     });
   }

   async executePolling(){
     try{
     this.dataFromSheetAsJson = await this.updateDataFromSheet();
     if(this._commandsInSheet > this._lastExecutedCommand){
        this._lastExecutedCommand = this._commandsInSheet;

        this.setGoogleStates();
        this.emit("newCommadInSheet",this._lastCommand);
      }
     if(!this._pollingAbort)
        this._timeout = setTimeout(this.executePolling.bind(this),this._pollingInterval);
      }
      catch(error)
      {
        MyUtility.getInstance().console.log("can't read data from url!");
        MyUtility.getInstance().console.log(error);
        this.abortPolling();
      }
   }

   restartPolling(){
     this._pollingAbort = false;
     this.executePolling();
   }

   abortPolling(){
     console.log("abortPolling");
     this._pollingAbort = true;
     if(this._timeout)
     {
      clearTimeout(this._timeout);
      this._timeout = undefined;
      }
   }
 }
