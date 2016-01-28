var express = require('express');
var app = express();
var https = require('https');

// SALESFORCE SETUP
var nforce = require('nforce');
var salesforceApi = process.env.SALESFORCE_API || '35.0';
var sfdcOrg = nforce.createConnection({
	clientId: process.env.SALESFORCE_CONSUMER_KEY,
	clientSecret: process.env.SALESFORCE_CONSUMER_SECRET,
	redirectUri: '',
	apiVersion: salesforceApi,  // optional, defaults to v24.0
	environment: 'sandbox'  // optional, sandbox or production, production default
});
var oauth;

function sfdcAuthenticate(callback){
	console.log('Authenticate called');
	// authenticate using username-password oauth flow
	sfdcOrg.authenticate({ 
		username: process.env.SALESFORCE_USERNAME,
		password: process.env.SALESFORCE_PASSWORD },
                function(err, resp){
		if(err) {
		  console.log('Error: ' + err.message);
		} else {
		  console.log('Access Token: ' + resp.access_token);
		  oauth = resp;
		}
		if(callback){
			callback();
		}
	});
}

// BODY PARSER
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

// SERVE STATIC PAGES
app.use('/facebook', express.static(__dirname + '/views')); 

// GET: FacebookLeadGen
app.get('/FacebookLeadGen', function (req, res) {
  // get verify token from facebook and send response accordingly
  if (req.param('hub.verify_token') == (process.env.VERIFY_TOKEN) ) {
  	res.send(req.param('hub.challenge'));
  } else {
	res.send('Hello World!');
  }
});

// POST: FacebookLeadGen
app.post('/FacebookLeadGen', function (req, res) {
  
  console.log('LUCY DEBUG: Got a POST request');
  console.log(req.body); 

  var object = req.body.object; 
  var changes = req.body.entry[0].changes; 

  console.log ('object:' + object);
  console.log ('LUCY entry[0]:' + req.body.entry[0]);
  console.log ('LUCY changes:' + req.body.entry[0].changes);
  console.log ('LUCY id:' + req.body.entry[0].id);
  console.log ('LUCY time :' + req.body.entry[0].time);
  console.log ('LUCY changes[0]:' + req.body.entry[0].changes[0]);
  console.log ('LUCY changes[0].field:' + req.body.entry[0].changes[0].field);


  for (var i=0; i< req.body.entry[0].changes.length; i++){
  	console.log('change.field: ' + req.body.entry[0].changes[i].field);
  	console.log('change.leadgenID: ' + req.body.entry[0].changes[i].value.leadgen_id);
  	console.log('change.formID: ' + req.body.entry[0].changes[i].value.form_id);
  	console.log('change.created_time: ' + req.body.entry[0].changes[i].value.created_time);
  }

  res.send('yay');

}); 


var callback = function(response) {
  var str = '';
  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });
  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log(str);
    var dataList = JSON.parse(str).field_data;
    
    var newLead = nforce.createSObject('Lead');

    for (var i=0; i< dataList.length; i++){
    	if (dataList[i].name == 'full_name') {
    		console.log('lead name: ' + dataList[i].values[0]);
    		newLead.set('Name', dataList[i].values[0]);
    	}
    	if (dataList[i].name == 'email') {
    		console.log('lead email: ' + dataList[i].values[0]);
    		newLead.set('Email', dataList[i].values[0]);
    	}
    	if (dataList[i].name == 'phone_number') {
    		console.log('lead phone: ' + dataList[i].values[0]);
    		newLead.set('Phone', dataList[i].values[0]);
    	}
    }

	sfdcOrg.insert({ sobject: newLead, oauth: oauth }, function(err, resp){
  		if (err) {
	      	console.log(err);
	    	if (err.statusCode == 401){
	    		console.log('Logging in again...');
	    		sfdcAuthenticate(createLead(leadRec, request, response));
	    	}
	    	else{
	    		console.log('INSERT ERROR: ' + err.message);
	    	}
	    } else {
	    	if (resp.success == true) {
				console.log('INSERT SUCCESS');
	      	}
	  	}
	});

  });
};

/*
function SFLead() {
	this.setName = function(name) {
		this.name = name; 
	};
	this.setEmail = function(email){
		this.email = email;
	}
	this.setPhone = function (phone){
		this.phone = phone; 
	}
}*/

//
app.get('/testing', function(req,res) {
	var options = {
  		host: 'graph.facebook.com',
  		path: '/1691930984420345?access_token='+ process.env.FACEBOOK_PAGE_TOKEN 
	};
	sfdcAuthenticate(null);
	https.request(options, callback).end();

	res.send('hello'); 
});


/*
app.get('/SubscribeFacebookPage', function(req, res) {
	res.render('/index'); 
});*/



app.listen( process.env.PORT || 5000, function() {
  console.log('Node app is running on port', process.env.PORT);
});
