module.exports = function(){
    // This isnt heroku
    if(!process.env.MONGOLAB_URI){
	return "mongodb://localhost/patatap"
    }
    else{
	return process.env.MONGOLAB_URI
    }
}
