#!/usr/bin/env node
var fs = require('fs')
   //,builder = require('./builder')
   ,showdown = require('./vendor/showdown');

String.prototype.toHTML = function(){
	return showdown.makeHTML(this);
};

var md = fs.readFileSync('../../Docs/Core/Lang.md').toString();
console.log(md.toHTML());

