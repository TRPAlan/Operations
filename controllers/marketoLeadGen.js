var unirest = require('unirest');
var async = require('async');


// GET 
exports.get = function (req, res) {
    // get verify token from facebook and send response accordingly
    if (req.param('hub.verify_token') == (process.env.VERIFY_TOKEN) ) {
      res.send(req.param('hub.challenge'));
    } else {
      res.send('Invalid Verify Token');
    }
}


// POST 
exports.post = function (req, res) {

  console.log('MarketoLeadGen: Got a POST request');

  var object = req.body.object; 
  var changes = req.body.entry[0].changes; 

  for (var i=0; i< req.body.entry[0].changes.length; i++){
    var leadGenId = req.body.entry[0].changes[i].value.leadgen_id; 
    var formId = req.body.entry[0].changes[i].value.form_id; 
    // log out information related to lead
      console.log('MarketoLeadGen: leadgenID: ' + leadGenId + ' formID: '+ formId + ' createdTime:' + req.body.entry[0].changes[i].value.created_time);
      insertLead(leadGenId, formId); 
  }

  res.send('post MarketoLeadGen: SUCCESS');
}

// chained async requests for inserting lead into marketo
var insertLead = function (leadGenId, formId) {
  async.waterfall([

    // 1. get lead information using leadGenId
    function(callback) {
      unirest.get('https://graph.facebook.com/' + leadGenId + '?access_token='+ process.env.FACEBOOK_PAGE_TOKEN) 
      .end(function (response) {
        
        var dataList = JSON.parse(response.body).field_data;
        var name, email, phone; 

        for (var i=0; i< dataList.length; i++){
          if (dataList[i].name == 'full_name') {
            name = dataList[i].values[0];
          }
          if (dataList[i].name == 'email') {
            email = dataList[i].values[0];
          }
          if (dataList[i].name == 'phone_number') {
            phone = dataList[i].values[0];
          }
        }

        console.log('MarketoLeadGen: phone:' + phone + ' name:' + name + ' email:' + email);

        callback(null, name, email, phone);

      });
    },

    // 2. get marketo access token 
    function(name, email, phone, callback) {
      unirest.get('https://615-KOO-288.mktorest.com/identity/oauth/token?grant_type=client_credentials&client_id=' + process.env.MKT_CLIENT_ID + '&client_secret=' + process.env.MKT_CLIENT_SECRET)
      .end(function (response) {
        callback(null, name, email, phone, response.body.access_token);
      });
    },

    // 3. insert lead into marketo with the access token
    function (name, email, phone, token, callback) {
        var firstName = name.split(' ').slice(0, -1).join(' ');
        var lastName = name.split(' ').slice(-1).join(' ');
        
        var inputJson; 
        if (phone == null) {
          inputJson = {"action": "createOrUpdate", "lookupField": "email",
            "input": [{
              "email": email,
              "firstName": firstName,
              "lastName": lastName,
              "leadSource": "Facebook Lead Ads",
              "Facebook_Form_Id__c" : formId 
            }]};
        } else {
          inputJson = {"action": "createOrUpdate", "lookupField": "email",
            "input": [{
              "email": email,
              "firstName": firstName,
              "lastName": lastName,
              "phone": phone,
              "leadSource": "Facebook Lead Ads",
              "Facebook_Form_Id__c" : formId 
            }]};
        }
        
        unirest.post('https://615-KOO-288.mktorest.com/rest/v1/leads.json?access_token='+ token)
          .type('application/json')
          .send(inputJson)
          .end(function (response) {
            console.log(response.body);
          }); 
    }

  ]);
}


