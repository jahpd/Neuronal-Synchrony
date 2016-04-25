// Modules
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var mongoose = require('mongoose');

// Custom modules
var calcMD5 = require('./lib/md5');

// Application conf
app
    .use('/assets',      express.static(path.join(__dirname, 'assets')))   // static files
    .get('/', function(req, res){                                          // index
	res.sendFile(__dirname + '/test.html');
    });


// Database
isOpen =  false;
var Musician = mongoose.model('Musician', mongoose.Schema({
    history: Array,
    hash: String
}));

var on =  function on(socket, n, fn){
    socket.on(n, function(msg){
	if(isOpen){
	    fn(msg);
	};
    });
};

var save = function save(musician, cb){
    musician.save(function(err, m){
	if (!err){
	    cb(m);
	}
	else{
	    throw new Error()
	}
	
    });
};

var find = function find(hash, cb){
    Musician.findOne({hash: hash}, function(err, m){
	if (!err){
	    cb(m);
	}
	else{
	    throw new Error()
	}
	
    });
}

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/patatap', function (error) {
    if (error) console.error(error);
    else console.log('MongoDB connected');
    isOpen = true;
});

var db = mongoose.connection;

io.set('transports', [ 'polling', 'websocket' ]);
io.on('connection', function(socket){
    
    on(socket, 'user hash', function(msg){
	var musician = new Musician({history:[]});
	console.log(musician._id)
	musician.hash = calcMD5(musician._id+' '+Math.random())
	save(musician, function(m){
	    console.log("=> "+m.hash+" created in Patatap database")
	    io.emit('user hash', {user:{hash: m.hash}});
	});	    
	Musician.count({}, function( err, count){
	    console.log( "Number of users:", count );
	})
    });

    on(socket, 'user loaded', function(msg){
	find(msg.user.hash, function(musician){
	    console.log("=> "+musician.hash+" loaded audios")
	    musician.history.push({what: 'loaded audios', time: Date.now()});
	    save(musician, function(m){
		io.emit('user loaded', {user:{hash: m.hash}});
	    })
	})
    })
    
    
    on(socket, 'user trigger', function(msg){
	find(msg.user.hash, function(musician){
	    console.log("=> User "+musician.hash+" triggered animation"+msg.animation.hash);
	    musician.history.push({what: 'trigger', time: Date.now(), animation: {hash: msg.animation.hash}});
	    save(musician, function(m){
		io.emit('user trigger', msg);
	    });
	});
    });

    socket.on('disconnect', function(msg){
	console.log('=> Some user disconnected');
	Musician.count({}, function( err, count){
	    console.log( "Number of users:", count );
	});
    });
    
});

var port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
http.listen(port, ip , function(){
    console.log('=> Patatap listening on '+ip+':'+port);
});
