var https = require('https');
var unirest = require('unirest');

var marketoCallback = function (response, formId, name, email, phone) {
  var str = '';
  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });
  //the whole response has been recieved
  response.on('end', function () {
  	console.log(str);
    var firstName = name.split(' ').slice(0, -1).join(' ');
    var lastName = name.split(' ').slice(-1).join(' ');

  	unirest.post('https://615-KOO-288.mktorest.com/rest/v1/leads.json?access_token='+ JSON.parse(str).access_token)
  	.type('application/json')
  	.send({"action": "createOrUpdate", "lookupField": "email",
  		"input": [{
  			"email": email,
  			"firstName": firstName,
        "lastName": lastName,
  			"phone": phone,
  			"leadSource": "Facebook Lead Ads",
        "Facebook_Form_Id__c" : formId // LEAD FORM ID
  		}]})
  	.end(function (response) {
  		console.log(response.body);
	});
/*

var bodyStr = '{"action": "createOrUpdate","lookupField": "email","input": [{"email": "' +  leadEmail +'","firstName": "' + leadName + '","phone": "' + leadPhone + '"}]}';

	https.request({
  			host: '615-KOO-288.mktorest.com',
  			path: '' ,
  			method: 'POST',
  			header: {
  				'Content-Type': 'application/json',
  				'Content-Length': bodyStr.length
  			}
		}, function (res2) {
			var str = '';
			response.on('data', function (chunk) {
    			str += chunk;
  			});
  			response.on('end', function () {

  				console.log('post success! ' + JSON.parse(str)); 
  			});
			
		}).write(bodyStr);*/


  }); 
}


var insertLeadCallback = function(response, formId) {
  var str = '';
  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });
  //the whole response has been recieved
  response.on('end', function () {
    var dataList = JSON.parse(str).field_data;
    var name, email, phone; 

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
    		phone = dataList[i].values[0];
    	}
	}
	
	https.request({
			host: '615-KOO-288.mktorest.com',
			path: '/identity/oauth/token?grant_type=client_credentials&client_id=' + process.env.MKT_CLIENT_ID + '&client_secret=' + process.env.MKT_CLIENT_SECRET
		}, function (response) {
      marketoCallback(response, formId, name, phone, email);
    }).end();

	});
}; 


// GET 
exports.get = function (req, res) {
	  // get verify token from facebook and send response accordingly
	  if (req.param('hub.verify_token') == (process.env.VERIFY_TOKEN) ) {
	  	res.send(req.param('hub.challenge'));
	  } else {
      res.send('Invalid Verify Token');
	  }
};


// POST 
exports.post = function (req, res) {

  console.log('LUCY DEBUG: Got a POST request');

  var object = req.body.object; 
  var changes = req.body.entry[0].changes; 

  for (var i=0; i< req.body.entry[0].changes.length; i++){
		var leadGenId = req.body.entry[0].changes[i].value.leadgen_id; 
		// log out information related to lead
  		console.log('change.leadgenID: ' + req.body.entry[0].changes[i].value.leadgen_id);
  		console.log('change.formID: ' + req.body.entry[0].changes[i].value.form_id);
      var leadFormId = req.body.entry[0].changes[i].value.form_id; 

  		console.log('change.created_time: ' + req.body.entry[0].changes[i].value.created_time);

			https.request({
  				host: 'graph.facebook.com',
  				path: '/' + leadGenId + '?access_token='+ process.env.FACEBOOK_PAGE_TOKEN 
			}, function(response) {
        insertLeadCallback(response, leadFormId);
      }).end();
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