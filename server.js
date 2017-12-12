var express = require('express');
var path = require('path');
var fs = require("fs");
var bodyParser = require('body-parser');
var nano = require('nano')('http://localhost:8080');
var app = express();
var multer  = require('multer');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var upload = multer({dest:__dirname + '/upload'});
var type = upload.single('file');

app.use('/', express.static(__dirname + '/'));
app.use('/', express.static(__dirname +'/Images'));

var cloudantUserName = "premdutt09";
var cloudantPassword = "sharma06@";
var dbCredentials_url = "https://"+cloudantUserName+":"+cloudantPassword+"@"+cloudantUserName+".cloudant.com"; // Set this to your own account 

// Initialize the library with my account. 
var cloudant = require('cloudant')(dbCredentials_url);

var dbForLogin = cloudant.db.use("logindetails");
var dbForStudentUniversityData = cloudant.db.use("studentuniversitydata");
var dbForAdminUniversityRequestTable = cloudant.db.use("adminuniversityrequesttable");
var dbForAdminRequestTable = cloudant.db.use("adminrequesttable"); 


// viewed at http://localhost:8080
app.get('/', function(req, res) {
console.log("Open LoginPage.html page");
    res.sendFile(path.join(__dirname + '/LoginPage.html'));
});

app.post('/loginData', function (req, res) {
console.log("Got a POST request for LoginPage.html page");
console.log(JSON.stringify(req.body));
var userName = req.body.username;
console.log(userName);
var password = req.body.password;
console.log(password);
	dbForLogin.get(userName, function(err, body) {
	  if (!err) {
		var dbPassword = body.agentPassword;
		if(dbPassword === password){
			var response = {
				status  : 200,
				message : 'Success'
			}
			res.send(JSON.stringify(response));	
		}else{
			var response = {
				status  : 300,
				message : 'Username and Password does not match'
			}
			res.send(JSON.stringify(response));	
		}	
	  }else{	
	  console.log(err);
			var response = {
				status  : 400,
				message : 'Username does not exists'
			}
			res.send(JSON.stringify(response));	
		}
	});
});

app.post('/requestTableData', function (req, res) {
console.log("Got an on-load POST request for RequestTable.html page");
	dbForAdminUniversityRequestTable.list({ include_docs: true },function(err, body) {
		  if (!err) {
			  console.log('Data is sent to the page.')
			var response = {
				status  : 200,
				message : body
			}
			res.send(JSON.stringify(response));	
		  }else{
			var response = {
				status  : 400,
				message : 'No data found.'
			}
			res.send(JSON.stringify(response));			
		  }  
	})
});
	
app.post('/applicantData', function (req, res) {
console.log("Got a POST request for RequestTable.html page");
console.log(req.body);
var userData = "";
	dbForStudentUniversityData.list({ include_docs: true },function(err, body) {
	  if (!err) {
		console.log(body.rows[0].doc);
		for(var i=0; i<body.rows.length; i++){
			if(body.rows[i].doc.digitalId === req.body.id){
				userData = body.rows[i].doc;
				console.log(userData);
			}
		}
			var response = {
				status  : 200,
				message : userData
			}
			res.send(JSON.stringify(response));			
		}else{
			var response = {
				status  : 400,
				message : 'No data found for this applicant.'
			}
			res.send(JSON.stringify(response));			
		}
	})
});

app.post('/applicantDataStatus', function (req, res) {
console.log("Got a POST request for StudentDetails.html page");
console.log(req.body);
	var newstatus = req.body.status;
	var id = "";
	var revId = "";
	var requestDate = "";
	var appliedFor = "";
	var applicantName = "";
	var digitalId = "";
	dbForAdminUniversityRequestTable.list({ include_docs: true },function(err, body) {
	  if (err) {
		console.log('Issue in fetching data.');
	  }
	  console.log(body);
		for(var i=0; i<body.rows.length; i++){
			if(body.rows[i].doc.digitalId === req.body.id){
				id = body.rows[i].doc._id;
				revId = body.rows[i].doc._rev;
				requestDate = body.rows[i].doc.requestDate;
				applicantName = body.rows[i].doc.applicantName;
				appliedFor = body.rows[i].doc.appliedFor;
				digitalId = body.rows[i].doc.digitalId;
			}
		}
		console.log('Status to be updated for reqId : '+ id);
		dbForAdminUniversityRequestTable.insert({ _id: id, _rev: revId, status: newstatus, digitalId: digitalId, requestDate: requestDate, applicantName: applicantName, appliedFor: appliedFor, digitalIdVerified: req.body.digitalIdVerified }, function(err, body) {
			  if (!err){
					var response = {
						status  : 200,
						message : 'Status updated.'
					}
					dbForAdminUniversityRequestTable.list({ include_docs: true },function(err, body) {
					  if (!err) {
						  console.log(body)
					  }
					})
					res.send(JSON.stringify(response));		
					console.log('Status updated.');	
			  }else{
					var response = {
						status  : 400,
						message : 'Issue in updating the status.'
					}
					console.log('Status updation issue.');		
		        	res.send(JSON.stringify(response));					  
			  }	
		})
	})
});

app.post('/verifyDigitalIdStatus', function (req, res) {
console.log("Got a POST request for StudentDetails.html page");
var message = "Failure";
var requestDate = "";
	dbForAdminRequestTable.list({ include_docs: true },function(err, body) {
	  if (err) {
		console.log('Issue in fetching data.');
	  }
		for(var i=0; i<body.rows.length; i++){
			if(body.rows[i].doc.digitalId === req.body.id && body.rows[i].doc.status == "Approved"){
				message = "Success";
				requestDate = body.rows[i].doc.requestDate;
			}
		}
		var response = {
			status : 200,
			message : message,
			requestDate : requestDate
		}
       	res.send(JSON.stringify(response));	
	});
});

app.listen(8080);