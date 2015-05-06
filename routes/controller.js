
//var userAccountsDB = require('../util/userAccountsDB');
var fs = require('fs-extended');
var Docker = require('dockerode');
var Git = require("nodegit");
var ghdownload = require('github-download');
var exec = require('exec');
var docker = new Docker({socketPath: '/var/run/docker.sock'});
var tar = require('tar-fs');
var fs = require('fs');

exports.login = function (req, res) {
	if(!req.body.hasOwnProperty('email') || !req.body.hasOwnProperty('password')) {
		res.statusCode = 400;
		console.log(req);
		return res.send('Error 400: Post syntax incorrect.');
	}

	var json = [];
	json.email = req.body.email;
	json.password = req.body.password;

	userAccountsDB.userLogin(function(err,results){
		if(err){
			console.log(err);
		}
		else
		{
			if(results==1){
				return res.send(req.body.email);
			}

			else if(results==0)
			{
				console.log("Invalid Id or Password");
				return res.send(err);
				//res.render('../views/LogInError.ejs');
			}
		}
	},json);
}

exports.signup = function (req, res) {
	if(!req.body.hasOwnProperty('email')  ) {
		res.statusCode = 400;
		return res.send('Error 400: Post syntax incorrect.');
	}
	var json = [];
	json.email = req.body.email;
	json.password = req.body.password;

	userAccountsDB.newUser(function(err,result){
		if(!err){
			return res.send("New User Created. Login to continue.");
		}
		else{
			return res.send(err);
    }
  },json);

}

exports.runCode = function (req, res) {
  if(!req.body.hasOwnProperty('technology')){
    res.statusCode = 400;
    return res.send('The client request does not specify the technology stack.');
  }

  var technology = req.body.technology;
  var path = req.body.email + '\/' + 'Dockerfile';

  if(!req.body.hasOwnProperty('github')){
    res.statusCode = 400;
    return res.send('Github Link was not provided. Try again.');
  }

  else{

    //Get code from Github Link.
    var gitPath = req.body.github;
    var dir = gitPath.split("/");
    var data = "";
    var rname = dir[4];
    console.log("Git Clone Started.");

    var node = "node";
    var start = req.body.start;
    data = "FROM centos:centos6 \nRUN rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm\n# Install Node.js and npm\nRUN yum install -y npm\n# Bundle app source\nCOPY \/"+dir[4]+"\n# Install app dependencies\nRUN cd "+dir[4]+"; npm install\nEXPOSE  8080\nCMD ['node', '"+start+"']";

    // Git.Clone(req.body.github, 'abcdef').then(function(repository) {
    //   // Work with the repository object here.
    //   console.log("Git Clone Successful");
    // });

    ghdownload(req.body.github,rname);

    console.log("What is going on??");

    if(technology == "MEAN"){
      var start = req.body.start;
      data = "FROM centos:centos6 \nRUN rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm\n# Install Node.js and npm\nRUN yum install -y npm\n# Bundle app source\nCOPY "+rname+"\n# Install app dependencies\nRUN cd "+rname+"; npm install\nEXPOSE  8080\nCMD ['node', '"+start+"']";
      console.log("data : " + data);
    }
    else if(technology == "java"){
      data = "";
    }
    else if(technology == "python"){
      data = "";
    }

    fs.createFile("/test/Dockerfile", data, function(err,result){

      if(err){
        return res.send('Error Creating Dockerfile: '+err);
      }

      else{
        tar.pack('./test').pipe(fs.createWriteStream('test.tar'),function(){
          //Docker Build.
          console.log("Successful Tar packing. I WAS HERE.");
          docker.buildImage("./test.tar", {t: "imageName"},function (err, response){
            //...
            if(err){
              console.log("Error with Docker Image Creation."+err);
            }
            else{
              return res.send("Successful creation of docker file.");
            }
          });
        })
        //Send Output of execution.
      }
    });


  }
  //res.send("OOPS.Something Went Wrong.");
}
