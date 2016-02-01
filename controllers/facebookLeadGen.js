var https = require('https');

// SALESFORCE SETUP
var nforce = require('nforce');
var salesforceApi = process.env.SALESFORCE_API || '35.0';
var sfdcOrg = nforce.createConnection({
	mode: 'single',
	clientId: process.env.SALESFORCE_CONSUMER_KEY,
	clientSecret: process.env.SALESFORCE_CONSUMER_SECRET,
	redirectUri: '',
	apiVersion: salesforceApi,  // optional, defaults to v24.0
	environment: 'sandbox',  // optional, sandbox or production, production default
	autorefresh: true
});


// GET 
exports.get = function (req, res) {
	  // get verify token from facebook and send response accordingly
	  if (req.param('hub.verify_token') == (process.env.VERIFY_TOKEN) ) {
	  	res.send(req.param('hub.challenge'));
	  } else {
		res.send('Invalid Verify Token');
	  }
};


var insertLeadCallback = function(response) {
  var str = '';
  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });
  //the whole response has been recieved
  response.on('end', function () {
    var dataList = JSON.parse(str).field_data;

    var newLead = nforce.createSObject('Lead');
    for (var i=0; i< dataList.length; i++){
    	if (dataList[i].name == 'full_name') {
    		console.log('lead name: ' + dataList[i].values[0]);
    		newLead.set('LastName', dataList[i].values[0]);
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

	sfdcOrg.insert({ sobject: newLead }, function(err, resp){
  		if (err) {
	      	console.log('INSERT ERROR: ' + err.message);
	    } else {
	    	if (resp.success == true) {
				console.log('INSERT SUCCESS');
	      	}
	  	}
	  });
	});
}

// POST 
exports.post = function (req, res) {
  
  console.log('LUCY DEBUG: Got a POST request');

  var object = req.body.object; 
  var changes = req.body.entry[0].changes; 

  // log out general object properties 
  console.log ('object:' + object);
  console.log ('LUCY entry[0]:' + req.body.entry[0]);
  console.log ('LUCY changes:' + req.body.entry[0].changes);
  console.log ('LUCY id:' + req.body.entry[0].id);
  console.log ('LUCY time :' + req.body.entry[0].time);
  console.log ('LUCY changes[0]:' + req.body.entry[0].changes[0]);
  console.log ('LUCY changes[0].field:' + req.body.entry[0].changes[0].field);


  sfdcOrg.authenticate({ username: process.env.SALESFORCE_USERNAME, password: process.env.SALESFORCE_PASSWORD },
        function(err, resp){
		if (err) {
		  console.log('SF Authentication Error: ' + err.message);
		} else {
		  console.log('SF Authentication Access Token: ' + resp.access_token);

		  // for each leadgen Id
		  for (var i=0; i< req.body.entry[0].changes.length; i++){
		  	var leadGenId = req.body.entry[0].changes[i].value.leadgen_id; 
		  	// log out information related to lead
  			console.log('change.field: ' + req.body.entry[0].changes[i].field);
  			console.log('change.leadgenID: ' + req.body.entry[0].changes[i].value.leadgen_id);
  			console.log('change.formID: ' + req.body.entry[0].changes[i].value.form_id);
  			console.log('change.created_time: ' + req.body.entry[0].changes[i].value.created_time);

		  		https.request({
  					host: 'graph.facebook.com',
  					path: '/' + leadGenId + '?access_token='+ process.env.FACEBOOK_PAGE_TOKEN 
				}, insertLeadCallback).end();
			}

		}
	});

	res.send('postFacebookLeadGen SUCCESS');
}; 
