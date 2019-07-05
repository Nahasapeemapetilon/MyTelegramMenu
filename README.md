# MyTelegramMenu
iobroker.telegram, iobroker,enums, nodejs, smarthome, generates a menu from the enumerations in the iobroker
[![NPM version](http://img.shields.io/npm/v/mytelegrammenu.svg)](https://www.npmjs.com/package/mytelegrammenu)
[![Downloads](https://img.shields.io/npm/dm/mytelegrammenu.svg)](https://www.npmjs.com/package/mytelegrammenu)


[![NPM](https://nodei.co/npm/mytelegrammenu.png?downloads=true)](https://nodei.co/npm/mytelegrammenu/)

## install
 - install and configure the [iobroker.telegram adapter](https://github.com/ioBroker/ioBroker.telegram)
 - install this package in your iobroker folder with
```
npm install mytelegrammenu
```
 - create a new javascript in the iobroker
 - add the following lines
```
let MyTelegramMenu = require('mytelegrammenu');
let myEnumList =   ['rooms','obergeschoss','functions'];
let telegramMenu = new MyTelegramMenu(this,myEnumList);
```
 - adjust the second line in the script and select the enumeration you want to get displayed in telegram

 -you can find the name of enum there

![enums name](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img001.JPG?raw=true)

![enums name2](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img002.JPG?raw=true)


- you can display the menu like this


![you can display the menu like this](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img004.JPG?raw=true)

- choose an enum and a function


![choose an enum and a function](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img005.JPG?raw=true)



![...](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img006.JPG?raw=true)



![control the states](https://github.com/Nahasapeemapetilon/MyTelegramMenu/blob/master/img/img007.JPG?raw=true)


## todo
```
 - only support boolean states
 - changeing mode to query mode for states
```
