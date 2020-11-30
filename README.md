# MyTelegramMenu
iobroker.telegram, iobroker,enums, nodejs, smarthome,telegram, telegra.ph,generates a menu from the enumerations in the iobroker, IFTTT , Google Home , Google Sheets
[![NPM version](http://img.shields.io/npm/v/mytelegrammenu.svg)](https://www.npmjs.com/package/mytelegrammenu)
[![Downloads](https://img.shields.io/npm/dm/mytelegrammenu.svg)](https://www.npmjs.com/package/mytelegrammenu)


[![NPM](https://nodei.co/npm/mytelegrammenu.png?downloads=true)](https://nodei.co/npm/mytelegrammenu/)

## demo

<p align="left" >  
  <img src="https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/iobrokerTelegramMenu.gif" title="telegram demo">
</p>

## install
 - install and configure the [iobroker.telegram adapter](https://github.com/ioBroker/ioBroker.telegram)
 <s>
 - install this package in your iobroker folder with

```
npm install mytelegrammenu
```
</s>
 - add the additional npm package to the javascript adapter instance:

 <p align="left" >  
   <img src="https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/add_package.gif" title="add npm package">
 </p>

 - create a new javascript in the iobroker
 - add the following lines
```
const MyTelegramMenu = require('mytelegrammenu');                         
const options = {'enumList': ['rooms','functions'],                                  
                 'locale':'de'};
const telegramMenu = new MyTelegramMenu(this,options);
```
### configure

you can set the following options, in the second line
  - 'enumList' to select the enumeration you want to get displayed in telegram
    - e.g. -> 'enumList': ['rooms','functions']
    - possible value is a list of enumerations-name
  - 'locale' to select language setting
    - e.g. ->'locale':'en'
    - possible values are 'de','en'
  - 'telegramInstance' to select the telegram adapter instance
    - e.g. 'telegramInstance' : 'telegram.0'
    - possible value is a string of telegram adapter id
  - 'feedbackToTelegram' if a state is switched via telegrammenu, you'll get an response
    - e.g. 'telegramInstance': 'true'
    - possible value is a boolean = true or false
  - 'showRootItemsCommand' the command to display the menu
    - e.g. 'showRootItemsCommand' : '/showMenu'
    - this command should always start with an /
  - 'MenuRows' how many buttons are there in a row?
    - e.g.  'MenuRows':3
  - 'MenuCols' how many buttons are in the column
    - e.g. 'MenuCols':2
  - 'enableGooglePolling' enable google sheet watching
    - e.g 'enableGooglePolling' : true
  - 'pollingInterval' how often the google sheet file is read in ms
    - e.g. 'pollingInterval' : 700
  - 'googleURL' JSON endpoint URL of your public Google Spreadsheets file
    - e.g. 'googleURL' : 'https://spreadsheets.google.com/feeds/cells/<yourIDCode>/1/public/full?alt=json'
  -  googleEnumList : the enumeration list you want to use for google control


#### default Options
  - if you don't set an option value, the default values are:
```
  'locale' = 'de'
  'enumList' = ['rooms']
  'telegramInstance' = 'telegram.0'
  'feedbackToTelegram' = true
  'showRootItemsCommand' = '/menue'
  'MenuRows' = 3
  'MenuCols' = 2
  'enableGooglePolling' = false
  'pollingInterval' = 750;
  'googleURL' = '';
  'googleEnumList' = '';

```
##### adding a enum-objects for telegrammenu
<p align="left" >  
  <img src="https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/addEnumsAndTest.gif" title="telegram demo">
</p>

##### supported types
- device and channel
  - add all sub states
- states from type boolean (switch and button)
- states from type number

if the states are writeable u can change all values with the menu

if a state not writeable telegrammenu show the current value of the state

### menu control

- you can display the menu like this:
```
/menue
```

![you can display the menu like this](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img004.JPG?raw=true)


### report states with telegra.ph
<p align="left" >  
  <img src="https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/createReport.gif" title="telegram demo">
</p>

### creating google sheets JSON endpoint
<p align="left" >
  to control the telegram menu with google home we need google sheets as a JSON Endpoint
  <ol>
  <li>Create a spreadsheet in Google Spreadsheets.
  <ol>
  <li>go&nbsp;<a href="google%20spreadsheets">https://docs.google.com/spreadsheets/u/0/</a></li>
  </ol>
  </li>
  <li>Publish the sheet to the web.</li>
  <li>share the document with anyone and copy the link</li>
  <li>use the tempate link :
  <ol>
  <li><a href="https://spreadsheets.google.com/feeds/cells/1g4FBktkm7al3ZkDI8LuFXuztTqK4nY-eUYMLep6BRuw/1/public/full?alt=json" rel="nofollow noopener noopener nofollow noopener">https://spreadsheets.google.com/feeds/cells/&lt;YourCodeID&gt;/1/public/full?alt=json</a></li>
  </ol>
  </li>
  <li>use the link in options</li>
  </ol>
    <p align="left" >  
        <img height = 500 width = 500 src="https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/createJSON.gif" title="create a json sheet"></p>
</p>

### Connect IFTTT to the google sheet
<ol>
 <li>connect itfff to the table and then we can say google commands and these are written into the table.
   the telegram bot reads the table and executes the commands in iobroker</li>
  <li> go to https://ifttt.com/create/ and create the applet :</li>
  </ol>
   <p align="left" >  
       <img height = 500 width = 500 src="https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/createIFTTT.gif" title="create a json sheet"></p>

### adding a enum-objects for google commands
<p align="left">
<ol>
<li> than you can say "ok google Enum-Name StateName"</li>
<li> and the bot is looking for the state and switch it</li>
<li> only button or switch </li>
</ol>
</p>
<p align="left" >  
    <img height = 500 width = 500 src="https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/createGoogleEnum.gif" title="create a json sheet"></p>

### Changelog

#### 0.12 (2020-11-29)

* adding polling for google sheets
* adding new options for polling
* control states over google commands(reading sheets)
* refactoring telgrammenu and google comannds
* putting telegram commands in command pattern

#### 0.11 (2020-11-22)

* Output text to telegram adjusted for non-writeable values. 
* fix unhandledRejection
* validity range when setting values (for example shelly shutter min/max position)
