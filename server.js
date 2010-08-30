#!/usr/bin/env node
// Run this from the directory of your docs.
//   $ cd Docs
//   $ node ../browser/server.js
var root = process.cwd();
process.chdir(__dirname);

var sys      = require("sys")
  , http     = require("http")
  , url      = require("url")
  , path     = require("path")
  , fs       = require("fs")
  , showdown = require('./lib/vendor/showdown')
  , builder  = require('./lib/builder')
  , jt       = require('./lib/vendor/json-template').jsontemplate
  , yaml     = require('./lib/vendor/js-yaml')
  , config   = yaml.eval(fs.readFileSync('config.yml').toString());

String.prototype.toHTML  = function(){ return showdown.makeHTML(this); };
Array.prototype.getLast  = function(){ return (this.length) ? this[this.length - 1] : null; }
Array.prototype.contains = function(item, from){ return this.indexOf(item, from) != -1; }
var docNames = config.docs.map(function(item){ return item.split('/').getLast(); });

builder.buildNav(config.docs);

http.createServer(function(request, response) {  
	var filename
	  , uri      = url.parse(request.url).pathname
	  , isIndex  = docNames.contains(uri.slice(1,-1))
	  , isRoot   = uri == '/'
	  , isStatic = uri.match(/^\/static/)
	  , markdown = !(isRoot || isIndex || isStatic);
	 
	if (isRoot){
		filename = './static/welcome.html';
	} else if(isIndex) {
		filename = './static/docs' + uri + '/index.html';
	} else if (isStatic){
		filename = '.' + uri;
	} else {
		var lib = uri.split('/')[1];
		var index = docNames.indexOf(lib);
		filename = path.join(config.docs[index], uri.replace('/'+lib, '').replace(/\/$/, '') + '.md');
		console.log('filename: ', filename);
	}
	path.exists(filename, function(exists) {  
		// file not found
		if(!exists) {  
			response.writeHead(404, {"Content-Type": "text/plain"});  
			response.write("404 Not Found\n");  
			response.end();  
			return;  
		}
		//sys.puts('/GET ' + uri);
		
		// root
		fs.readFile(filename, "binary", function(err, file) {  
			if(err) {  
				response.writeHead(500, {"Content-Type": "text/plain"});  
				response.write(err + "\n");  
				response.end();  
				return;  
			}  
			response.writeHead(200);
			if (markdown){
				var template = jt.Template(fs.readFileSync('./templates/doc.html').toString());
				file = template.expand({content: file.toHTML()});
			}			
			response.write(file, "binary");  
			response.end();  
		});
	
		
	});  
}).listen(config.port);

sys.puts("Server running at http://localhost:"+config.port+"/");
sys.puts('CTRL-C To shutdown')