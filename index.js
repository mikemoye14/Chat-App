var http = require('http');
var fs = require('fs');

var server = http.createServer(function(req, res){

	req.setEncoding('utf8');
	res.writeHead(200, {'Content-Type': 'text/html'});
	var html = fs.createReadStream(__dirname + '/index.html');
	html.on('data', function(data){
		html.on('end', function(){
			res.end(data.toString());
		});
	});	
	return;
}).listen(8000, function(){
	console.log("Listening on port '8000'");
});

users = [];
users[0] = {id: '0', userName: 'MikeMoye14'};

var socket = require('socket.io').listen(server);

socket.sockets.on('connection', function (socket) {

	console.log('Socket conection established from ' + socket.handshake.address);
	
	socket.on('init', function (data) {	
		socket.emit('init', 'Connected to chat server');		 
		socket.emit('users', users);
	});	
	
	socket.on('name', function (data) {		
		users.push({id: socket.id, userName: data.toString()});	
		socket.broadcast.emit('name', {id: socket.id, userName: data.toString()});
		console.log(data.toString() + ' connected.');		
   });

	socket.on('chatMsg', function (data) {	
		console.log(data.userName + ' says: ' + data.msg);
		socket.emit('chatMsg', 'You said: ' + data.msg);
		socket.broadcast.emit('chatMsg', data.userName + ' says: ' + data.msg);		
   });

	socket.on("disconnect", function () {	
		users.forEach(function(val, index, users){			
			if(val.id == socket.id){			
				console.log(val.userName + ' disconnected.');
				users.splice(index,1);
				socket.broadcast.emit('chatMsg', val.userName + ' discconected.');
				socket.broadcast.emit('userDisconnect', val.id);			
			}		
		});
	});
});