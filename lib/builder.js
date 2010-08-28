var fs = require('fs')
   ,jt = require('./vendor/json-template').jsontemplate;

var docPath     = '../Docs';
var categories  = [];
var headerRegex = /^(.+)[ \t]*\n-+[ \t]*\n+/gm;

String.prototype.trim = function(){
	return this.replace(/^\s+|\s+$/g, '');
};

this.buildNav = function(){

	// build up the categories and their docs
	fs.readdirSync(docPath).forEach(function(file){
		var filePath = docPath + '/' + file;
		if (fs.statSync(filePath).isDirectory()) {
			categories.push({name: file, docs: getDocsFromCategory(file)});
		}
	});
	
	// create the index file
	fs.readFile('./templates/index.html', function(err, data){
		if (err) throw err;
		var template = jt.Template(data.toString());
		var html = template.expand({'categories': categories});
		fs.writeFile('./static/index.html', html, function (err) {
			if (err) throw err;
			console.log('Index file created');
		});
	});
	
};

function getDocsFromCategory(category){
	var path = docPath + '/' + category;
	return fs.readdirSync(path).map(function(item){
		return {
		 'name': item.replace(/.md$/,'')
		, url: '/' + category + '/' + item
		, headers: getHeadersFromDoc(path + '/' + item)};
	});
}

function getHeadersFromDoc(path){
	var doc = fs.readFileSync(path).toString();
	var matches = doc.match(headerRegex);
	if (matches) {
		var ret = matches.map(function(header){
			var nameMatches = header.match(/((.+)?(([M|m]ethod:)|([F|f]unction:)|([P|p]roperty:)|([E|e]vent:))(.+) ){(.+)}/);
			// 3 = method, 4 = function, 5 = property, 6 = event
			return (nameMatches) ? {title: nameMatches[1].trim(), anchor: nameMatches[9].trim()} : false;
		}).filter(function(item){ return item });
		return ret;
	} else {
		return [];
	}
}