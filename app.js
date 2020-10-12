var http = require('http');
var fs = require('fs');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
	fs.readFile('./index.html', 'utf-8', function(error, content) {
        console.log('index.html rendu');
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

var clients = [];

// Chargement de socket.io
var io = require('socket.io').listen(server);

function reset(socket) {
    socket.emit('reset');
    socket.broadcast.emit('reset');
}

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {

    socket.on('error', function (error) {
        console.log('socket.io error');
        console.log(error.stack);
    });

    if (clients.length === 0) {
        socket.joueur = "joueur1";
        clients.push(socket);
    } else if (clients.length === 1) {
        socket.joueur = "joueur2";
        clients.push(socket);
        reset(socket);
    }

    socket.emit('joueur', socket.joueur);

    socket.broadcast.emit('nouveauJoueur', clients.length);
    socket.emit('nouveauJoueur', clients.length);

	socket.on('disconnect', function() {
        if (socket.joueur) {
            clients.splice(clients.indexOf(socket), 1);
            reset(socket);       
        }
    });

    socket.on('jouer', function(indexColonne) {
    	socket.broadcast.emit('jouer', indexColonne);
    });

});


server.listen(8080);