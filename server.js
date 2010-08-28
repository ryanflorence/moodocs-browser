#!/usr/bin/env node
// Run this from the directory of your docs.
//   $ cd Docs
//   $ node ../browser/server.js
var root = root = process.cwd();
process.chdir(__dirname);

var sys      = require("sys")
   ,http     = require("http")
   ,url      = require("url")
   ,path     = require("path")
   ,fs       = require("fs")
   ,showdown = require('./lib/vendor/showdown')
   ,builder  = require('./lib/builder')
   ,jt = require('./lib/vendor/json-template').jsontemplate;;

builder.buildNav();

String.prototype.toHTML = function(){
	return showdown.makeHTML(this);
};

http.createServer(function(request, response) {  
	var uri = url.parse(request.url).pathname;
	var filename;
	
	var markdown = true;
	if (uri == '/'){
		markdown = false;
		filename = './static/index.html';
	} else if (uri.match(/^\/static/)){
		markdown = false;
		filename = '.' + uri;
	} else {
		filename = path.join(root, uri);
	}
	
	path.exists(filename, function(exists) {  
		// file not found
		if(!exists) {  
			response.writeHead(404, {"Content-Type": "text/plain"});  
			response.write("404 Not Found\n");  
			response.end();  
			return;  
		}
		sys.puts('/GET ' + uri);
		
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
}).listen(8888);

sys.puts("Server running at http://localhost:8001/");
sys.puts('CTRL-C To shutdown')