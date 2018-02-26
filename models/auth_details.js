const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/newtest');

const user_authorization_Schema = mongoose.Schema({_id: String, email: String, password: String},{versionKey: false});
const Authorization = mongoose.model('authorization', user_authorization_Schema);

module.exports.signup_user = function(details, callback){
	new Authorization(details).save().then(
			() => { callback(); });
}

module.exports.login_user = function(details, callback){
	Authorization.findOne(details,'email password', function(err, docs){
		if(err) throw err;
		console.log(docs);

		callback(null, docs);
	});
}

module.exports.findById = function(id, callback){
	Authorization.findById(id, function(err, docs){
		callback(err, docs);
	});
}

const user_Detail_Schema = mongoose.Schema({_id: String, sex: String, height: Number, age: Number});
const User_Details = mongoose.model('user_details', user_Detail_Schema);

module.exports.add_details = function(details, callback){
	new User_Details(details).save().then((docs)=> callback(null, docs))
}

module.exports.if_exists = function(details, callback){
	User_Details.findById(details).then(
			(docs) => {
				//console.log('------------------'+docs);
				callback(null, docs);			
			}
		);
}