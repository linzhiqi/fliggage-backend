module.exports = function(io){
	var ioObject = {
		'io': io,
		'connections': {}
	}

	ioObject.io.on('connection', function(socket){
		socket.on('new_connection', function(data) {
			console.log('Connection opened from uid: ' +  data.uid);
			ioObject.connections[data.uid] = socket;
		});
		socket.on('close_connection', function(data) {
			console.log('Connection closed from uid: ' +  data.uid);
			delete ioObject.connections[data.uid];
		});
		socket.on('disconnect', function(){
			var keys = Object.keys(ioObject.connections);
			for(var i in keys){
				var value = ioObject.connections[keys[i]];
				if(socket===value){
					console.log('Got disconnect event from uid: ' + keys[i]);
					delete ioObject.connections[keys[i]];
					break;
				}
			}
		});
	});

	return ioObject;
}