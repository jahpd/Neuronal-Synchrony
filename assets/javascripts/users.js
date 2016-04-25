$(function(){
    socket.emit('list users')
    socket.on('list users', function(msg){
	_.each(msg.hashes, function(e, i){
	    $li = $("<li id='"+e+"><a href='/users/history?id="+e+"'"+">"+e"</a></li>");
	    $("#list").append($li);
	})
    })
})
