window.addEvent('domready', function(){
	
	var resize = new Resizable('handle',{
		limit: {x: [20,null]},
		cookie: 'docsresizeable'
	});
	
});