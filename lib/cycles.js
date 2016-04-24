module.exports = cycles = {
    isOpen: false,
    on: function on(socket, n, fn){
	socket.on(n, function(msg){
	    if(cycles.isOpen){
		fn(msg);
	    };
	});
    },

    save: function save(musician, cb){
	musician.save(function(err, m){
	    if (!err){
		cb(m);
	    }
	    else{
		throw new Error()
	    }
	    
	});
    },
    
    find: function find(hash, cb){
	Musician.findOne({hash: hash}, function(err, m){
	    if (!err){
		cb(m);
	    }
	    else{
		throw new Error()
	    }
	    
	});
    }
}
