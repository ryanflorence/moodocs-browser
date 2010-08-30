var fs          = require('fs')
  , jt          = require('./vendor/json-template').jsontemplate
  , yaml        = require('./vendor/js-yaml')
  , rmrf        = require('./vendor/rm-rf')
  , config      = yaml.eval(fs.readFileSync('config.yml').toString());

String.prototype.trim = function(){ return this.replace(/^\s+|\s+$/g, ''); }
Array.prototype.getLast = function(){ return (this.length) ? this[this.length - 1] : null; }



Library = function(name, path){
	this.name = name;
	this.path = path;
	this.categories = this.getCategories();
}

Library.prototype = {
	
	headerRegex: /^(.+)[ \t]*\n-+[ \t]*\n+/gm,
	
	getCategories: function(){
		var categories = [];
		var self = this;
		fs.readdirSync(this.path).forEach(function(file){
			var filePath = self.path + '/' + file;
			if (fs.statSync(filePath).isDirectory()) {
				categories.push({name: file, docs: self.getDocsFromCategory(file)});
			}
		});
		return categories;
	},
	
	getDocsFromCategory: function(category){
		var self = this;
		var path = this.path + '/' + category;
		return fs.readdirSync(path).map(function(item){
			return {
			 'name': item.replace(/.md$/,'')
			, url: category + '/' + item.replace(/.md$/,'')
			, headers: self.getHeadersFromDoc(path + '/' + item)};
		});
	},
	
	getHeadersFromDoc: function(path){
		var doc = fs.readFileSync(path).toString();
		var matches = doc.match(this.headerRegex);
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
	},
	
	buildIndex: function(){
		var self = this;
		var libPath = './static/docs/' + this.name;
		fs.mkdirSync(libPath, 0775);
		fs.readFile('./templates/index.html', function(err, data){
			if (err) throw err;
			var template = jt.Template(data.toString());
			var html = template.expand({'categories': self.categories});
			fs.writeFile(libPath + '/index.html', html, function (err) {
				if (err) throw err;
			});
		});
		return this;
	}
};


this.buildNav = function(docPaths){
	// remove the docs folder altogether
	rmrf('./static/docs', function(){
		// make it again
		fs.mkdirSync('./static/docs', 0775);
		docPaths.forEach(function(path){
			var name = path.split('/').getLast();
			new Library(name, path).buildIndex();
		});
	});
	
};
