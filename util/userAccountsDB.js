var mongo = require("../util/common");
var dbc="j";
var collectionName = "userAccounts";

function newUser(callback,json){

	if(json.email && json.password){

		console.log("Email: "+ json.email );
		console.log("Pass: "+ json.password );

		mongo.getConnection(function(err,coll){
			if(err){
				console.log("Error: "+err);
			}
			else{
				dbc = coll;
			}
		},collectionName);

		dbc.insert({'email':json.email,'password':json.password},function (err,result){

			if(err){
				console.log(err);
				return res.send('Error 400: Error Creating a new user.');
				//db.close();
			}

			else{
				var success = "New User Created.";
				console.log("New User Created.");
				callback(null,success);
				//db.close();
			}
		});
	}
	else{
		var fail = "Insufficient Data.";
		console.log("Insufficient Data.");
		callback(fail,null);
		//db.close();
	}
}

exports.newUser = newUser;

function userLogin(callback,json){

	if(json.email && json.password){

		var authenticated;

		mongo.getConnection(function(err,coll){
			if(err){
				console.log("Error: "+err);
			}
			else{
				dbc = coll;
			}
		},collectionName);

		dbc.find({'email':json.email,'password':json.password },function (err,result){

			if(err){
				authenticated = 0;
				console.log(err);
				return res.send('Error 400: Error in Login.');
				//db.close();
			}

			else{

				var email;
				var bikerPassword;

				result.toArray(function(err,docs){

					if(!docs.length==0)
					{
						//console.log(docs);
						email = docs[0].email;
						password = docs[0].password;

						if(json.email==email && json.password == password)
						{
							authenticated = 1;
							console.log("User Authenticated");
							callback(null,authenticated);
						}
						else
						{
							authenticated = 0;
							console.log("User Not Authenticated");
							callback(null,authenticated);
						}
					}
					else{
						var authenticated = "User Does Not Exist.";
						console.log("ERROR CALL.");
						callback(null,authenticated);
					}
				});
			}
		});
	}
	else{
		var authenticated = "Insufficient Data.";
		console.log("Insufficient Data.");
		callback(null,authenticated);
		//db.close();
	}
}

exports.userLogin = userLogin;
