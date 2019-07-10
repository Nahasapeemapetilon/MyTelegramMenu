# MyTelegramMenu
iobroker.telegram, iobroker,enums, nodejs, smarthome, generates a menu from the enumerations in the iobroker
[![NPM version](http://img.shields.io/npm/v/mytelegrammenu.svg)](https://www.npmjs.com/package/mytelegrammenu)
[![Downloads](https://img.shields.io/npm/dm/mytelegrammenu.svg)](https://www.npmjs.com/package/mytelegrammenu)


[![NPM](https://nodei.co/npm/mytelegrammenu.png?downloads=true)](https://nodei.co/npm/mytelegrammenu/)

## demo

<p align="left" >  
  <img src="https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/iobrokerTelegramMenu.gif" title="telegram demo">
</p>

## install
 - install and configure the [iobroker.telegram adapter](https://github.com/ioBroker/ioBroker.telegram)
 - install this package in your iobroker folder with
```
npm install mytelegrammenu
```
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
  - 'MenuRows' how many buttons are there in a row?
    - e.g.  'MenuRows':3
  - 'MenuCols' how many buttons are in the column
    - e.g. 'MenuCols':2

![enums name2](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img008.JPG?raw=true)

#### default Options
  - if you don't set an option value, the default values are:
```
  'locale' = 'de'
  'enumList' = ['rooms']
  'telegramInstance' = 'telegram.0'
  'feedbackToTelegram' = true
  'MenuRows' = 3
  'MenuCols' = 2;
```

##### you can find the name of enum there

![enums name](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img001.JPG?raw=true)

![enums name2](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img002.JPG?raw=true)

![enums name2](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img003.JPG?raw=true)

##### adding a enum object for telegrammenu


<p align="left" >  
  <img src="https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/addEnumsAndTest.gif" title="telegram demo">
</p>

![enums name2](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img009.jpg?raw=true)

##### supported types
- device and channel
  - add all sub states
- states from type boolean (switch and button)
- states from type number

if the states are writeable u can change all values with the menu

if a state not writeable telegrammenu show the current value of the state

### menu control

- you can display the menu like this

![you can display the menu like this](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img004.JPG?raw=true)

- choose an enum and a function


![choose an enum and a function](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img005.JPG?raw=true)



![...](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img006.JPG?raw=true)



![control the states](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img007.JPG?raw=true)


## todo
```
  -print in telegram a table overview of all states
```
