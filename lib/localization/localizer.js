class Localizer{
  constructor(){
    this._locale = 'de';
    this._translations = {};
  }
  getTranslatedMsg(key){
    if(!this._translations.hasOwnProperty(this._locale))
      this.addCurrentLocale();
    if(this._translations[this._locale])
    {
      if(this._translations[this._locale].hasOwnProperty(key))
        return this._translations[this._locale][key];
    }
    return key;
  }
  addCurrentLocale()
  {
    try{
      this._translations[this._locale] = require(`./${this._locale}.json`);
    }
    catch (err) {}
  }
  setLocale(locale)
  {
    this._locale = locale;
  }
}
const localizer = new Localizer();
//localizer.setLocale('en');
module.exports = localizer;
