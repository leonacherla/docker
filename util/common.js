var mongodb = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
var db;

// Initialize connection once
MongoClient.connect("mongodb://localhost:27017/bikingDatabase?maxPoolSize=300", function(err, database) {
  if(err){
    console.log("Error Creating MongoDB Connection Pool: "+err);
  }

  db = database;
});

function getConnection(callback,collectionName){

  db.collection(collectionName, function(err,coll){

    if(err){
      console.log("Error Connecting to collection: "+err);
    }
    else{
      callback(null,coll);
    }

  });
}

exports.getConnection = getConnection;
