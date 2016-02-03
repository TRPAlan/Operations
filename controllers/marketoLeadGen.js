var https = require('https');
var unirest = require('unirest');

var leadEmail, leadName, leadPhone, leadFormId; 

var marketoCallback = function (response) {
  var str = '';
  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });
  //the whole response has been recieved
  response.on('end', function () {
    console.log(str);
    console.log (leadEmail);
    console.log (leadName);
    console.log (leadPhone);
    var firstName = leadName.split(' ').slice(0, -1).join(' ');
    var lastName = leadName.split(' ').slice(-1).join(' ');

    unirest.post('https://615-KOO-288.mktorest.com/rest/v1/leads.json?access_token='+ JSON.parse(str).access_token)
    .type('application/json')
    .send({"action": "createOrUpdate", "lookupField": "email",
      "input": [{
        "email": leadEmail,
        "firstName": firstName,
        "lastName": lastName,
        "phone": leadPhone,
        "leadSource": "Facebook Lead Ads",
        "Facebook_Form_Id__c" : leadFormId // LEAD FORM ID
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


var insertLeadCallback = function(response) {
  var str = '';
  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });
  //the whole response has been recieved
  response.on('end', function () {
    var dataList = JSON.parse(str).field_data;

    for (var i=0; i< dataList.length; i++){
      if (dataList[i].name == 'full_name') {
        console.log('lead name: ' + dataList[i].values[0]);
        leadName = dataList[i].values[0];
      }
      if (dataList[i].name == 'email') {
        console.log('lead email: ' + dataList[i].values[0]);
        leadEmail = dataList[i].values[0];
      }
      if (dataList[i].name == 'phone_number') {
        console.log('lead phone: ' + dataList[i].values[0]);
        leadPhone = dataList[i].values[0];
      }
  }
  
  https.request({
      host: '615-KOO-288.mktorest.com',
      path: '/identity/oauth/token?grant_type=client_credentials&client_id=' + process.env.MKT_CLIENT_ID + '&client_secret=' + process.env.MKT_CLIENT_SECRET
    },  marketoCallback).end();

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

  // log out general object properties 
  console.log ('LUCY entry[0]:' + req.body.entry[0]);
  console.log ('LUCY changes:' + req.body.entry[0].changes);
  console.log ('LUCY id:' + req.body.entry[0].id);
  console.log ('LUCY time :' + req.body.entry[0].time);
  console.log ('LUCY changes[0]:' + req.body.entry[0].changes[0]);
  console.log ('LUCY changes[0].field:' + req.body.entry[0].changes[0].field);

  for (var i=0; i< req.body.entry[0].changes.length; i++){
    leadEmail = null;
    leadPhone = null;
    leadName = null;
    leadFormId = null; 
    var leadGenId = req.body.entry[0].changes[i].value.leadgen_id; 
    // log out information related to lead
      console.log('change.field: ' + req.body.entry[0].changes[i].field);
      console.log('change.leadgenID: ' + req.body.entry[0].changes[i].value.leadgen_id);
      console.log('change.formID: ' + req.body.entry[0].changes[i].value.form_id);
      leadFormId = req.body.entry[0].changes[i].value.form_id; 

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