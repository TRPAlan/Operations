var https = require('https');

// GET 
exports.get = function (req, res) {
	  // get verify token from facebook and send response accordingly
	  if (req.param('hub.verify_token') == (process.env.VERIFY_TOKEN) ) {
	  	res.send(req.param('hub.challenge'));
	  } else {
		res.send('Invalid Verify Token');
	  }
};

var marketoCallback = function (response) {
	var str = '';
  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });
  //the whole response has been recieved
  response.on('end', function () {

	https.request({
  			host: '615-KOO-288.mktorest.com',
  			path: '/rest/v1/leads.json?access_token=' + JSON.parse(str).access_token,
  			method: 'POST',
  			json: {
    			"action": "createOrUpdate",
    			"lookupField": "email",
    			"input": [
    				{
    					"email": email,
    					"firstName": name,
    					"phone": phone_number
    				}
    			]
			}
		}, function (res2) {
			console.log('post success! ' + res2); 
		});


  }); 
}


var insertLeadCallback = function(response) {
  var str = '';
  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });
  //the whole response has been recieved
  response.on('end', function () {
    var dataList = JSON.parse(str).field_data;

    var name, email, phone_number; 
    for (var i=0; i< dataList.length; i++){
    	if (dataList[i].name == 'full_name') {
    		console.log('lead name: ' + dataList[i].values[0]);
    		name = dataList[i].values[0];
    	}
    	if (dataList[i].name == 'email') {
    		console.log('lead email: ' + dataList[i].values[0]);
    		email = dataList[i].values[0];
    	}
    	if (dataList[i].name == 'phone_number') {
    		console.log('lead phone: ' + dataList[i].values[0]);
    		phone_number = dataList[i].values[0];
    	}
	}
	
	https.request({
			host: '615-KOO-288.mktorest.com',
			path: '/identity/oauth/token?grant_type=client_credentials&client_id=' + process.env.MKT_CLIENT_ID + '&client_secret=' + process.env.MKT_CLIENT_SECRET
		},	marketoCallback);
	
	});
}; 

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

	res.send('postFacebookLeadGen SUCCESS');
}

/*
    var bodyString = JSON.stringify({
    	action: 'createOrUpdate',
    	lookupField: 'email',
    	input: [
    		{
    			email: email,
    			firstName: name,
    			phone: phone,
    		}
    	]
	});
    console.log(bodyString);

    var headers = {
    	'Content-Type': 'application/json',
    	'Content-Length': bodyString.length
	};*/