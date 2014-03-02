var bounce = function(e) {
	e.addClass('switch');
	setTimeout(function() {
		e.removeClass('switch');
	}, 500);
};



$(document).ready(function() {
	/* register a socket! */
	var socket = io.connect('http://local.dev:8080');
	socket.emit('register', { 'player' : 'Kevin' });
	
	/* get the registered players */
	socket.emit('getPlayers', {} );
	
	socket.on('playersRegistered', function(data) {
		console.log(data);
	})
});
