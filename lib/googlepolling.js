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
         if(tEntries){
          this._commandsInSheet = tEntries.length;
          const {content: {$t : tLastCommand} } = tEntries[this._commandsInSheet-1];
          if(tLastCommand && (typeof tLastCommand ==='string' ||
                             tLastCommand instanceof String)){
            const tSplit = tLastCommand.split(':');
            if(tSplit.length > 0){
              this._lastCommand = tSplit[1].trim();
            }
          }
         }
       }
     } catch (error) {
       MyUtility.getInstance().console.log([MyUtility.getTranslatedMsg("JSONError"),error]);
       this._dataFromSheetAsJson = "";
       this.abortPolling();
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
     try
     {
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
        this.abortPolling();
      }
   }

   restartPolling(){
     MyUtility.getInstance().console.log("RestartPolling");
     if(this._timeout === undefined){
     this._pollingAbort = false;
     this.executePolling();
    }
   }

   abortPolling(){
     MyUtility.getInstance().console.log(MyUtility.getTranslatedMsg("pollingAbort"));
     this._pollingAbort = true;
     if(this._timeout)
     {
      clearTimeout(this._timeout);
      this._timeout = undefined;
    }
     if(MyUtility.getOptions().googlePollingRestart)
      setTimeout(this.restartPolling.bind(this),60000);
   }
 }
