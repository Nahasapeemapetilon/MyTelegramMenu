const Telegraph = require('telegra.ph')
const MyUtility = require('./myutility');

module.exports = class MenuItemReport{
  constructor(menuItem){
    this._item = menuItem;
    this._client = new Telegraph();
    this._access_token = undefined;
    this._tokenStateName = MyUtility.getStateName("TelegraphState");
  }
  async createTelegraphState(){
    await MyUtility.getIoBrokerFunctionsWithPromis().createState(this._tokenStateName , "",
                            {
                             read: true,
                             write: true,
                             desc: "Token for telegra.ph",
                             type: "string",
                             def: ""});
  }
  async initializeToken(){
    let currentToken = MyUtility.getInstance().getState(this._tokenStateName).val;
    if(currentToken == "")
    {
      const account = await this._client.createAccount("ioBroker","MyTelegramMenu-Bot","");
      currentToken = account.access_token;
      await MyUtility.getIoBrokerFunctionsWithPromis().setState(this._tokenStateName,currentToken);
    }
    this._access_token = currentToken;
      this._client.token = currentToken;
  }

  async getPage(){
    if(this._access_token != undefined && this._access_token != "")
    {

      const pages = await this._client.getPageList();
      const {total_count } = pages;
      if(total_count != undefined && total_count ==0)
        {
          const content = [{tag: 'h1', children: ['InitialPage']}];
          return await this._client.createPage(MyUtility.getTranslatedMsg('overview'), content);
        }
        else if(total_count > 0)    {
          return pages.pages[0]
        }
    }
    return undefined;
  }

  generateContentNodes(){
    const content = [];
    content.push({tag: 'h3', children: [this._item.Name]});
    content.push({tag: 'hr'});
    content.push(...this._item.GetNodeElementsForTelegraph());
    return content;
  }

  async setContentToPage()
  {
    const page = await this.getPage();
    const content =this.generateContentNodes();
    await this._client.editPage(page.path,MyUtility.getTranslatedMsg('overview'),content);
    return page.url;
  }

  async buildReport(){
     try{
       await this.createTelegraphState();
       await this.initializeToken();
       const url = await this.setContentToPage();
       MyUtility.sendMsgToTelegram(url);
      }
      catch(error)
      {
        MyUtility.getInstance().log(["Fehler:",error]);
      }
  }
}
