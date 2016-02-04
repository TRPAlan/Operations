var unirest = require('unirest');
var async = require('async');


// Salesforce setup
var nforce = require('nforce');
var salesforceApi = process.env.SALESFORCE_API || '35.0';
var sfdcOrg = nforce.createConnection({
	mode: 'single',
	clientId: process.env.SALESFORCE_CONSUMER_KEY,
	clientSecret: process.env.SALESFORCE_CONSUMER_SECRET,
	redirectUri: '',
	apiVersion: salesforceApi,  
	environment: 'sandbox',  // sandbox or production (default)
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


// POST 
exports.post = function (req, res) {
  
  console.log('FacebookLeadGen: Got a POST request');

  var object = req.body.object; 
  var changes = req.body.entry[0].changes; 

  // Salesforce Authentication 
  sfdcOrg.authenticate({ username: process.env.SALESFORCE_USERNAME, password: process.env.SALESFORCE_PASSWORD },
        function(err, resp){
		if (err) {
		  console.log('SF Authentication Error: ' + err.message);
		} else {
		  console.log('SF Authentication Access Token: ' + resp.access_token);

		  // insert lead for each leadgenId received
		  for (var i=0; i< req.body.entry[0].changes.length; i++){

        var leadGenId = req.body.entry[0].changes[i].value.leadgen_id; 
        var formId = req.body.entry[0].changes[i].value.form_id; 
        console.log('MarketoLeadGen: leadgenID: ' + leadGenId + ' formID: '+ formId + ' createdTime:' + req.body.entry[0].changes[i].value.created_time);
        insertLead(leadGenId, formId); 

      }

		}
	});

	res.send('post FacebookLeadGen: SUCCESS');
}; 


// insert lead into Salesforce
var insertLead = function (leadGenId, formId) {
  
  unirest.get('https://graph.facebook.com/' + leadGenId + '?access_token='+ process.env.FACEBOOK_PAGE_TOKEN)
  .end(
    function(response){
      var dataList = JSON.parse(response.body).field_data;
      var newLead = nforce.createSObject('Lead');
      
      for (var i=0; i< dataList.length; i++){
        
        if (dataList[i].name == 'full_name') { newLead.set('LastName', dataList[i].values[0]); }

        if (dataList[i].name == 'email') { newLead.set('Email', dataList[i].values[0]); }

        if (dataList[i].name == 'phone_number') { newLead.set('Phone', dataList[i].values[0]); }

      }

      newLead.set('LeadSource','Facebook Lead Ads'); 
      newLead.set('Facebook_Form_Id__c', formId); 

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

}; 



