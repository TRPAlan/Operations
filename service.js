var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

//console.log('LUCY IN APPLICATION');

app.use('/facebook', express.static(__dirname + '/views'));

// for authentication, our token is theredpin (go to facebook developer > webhooks )
app.get('/FacebookLeadGen', function (req, res) {
  // get verify token from facebook and send response accordingly
  if (req.param('hub.verify_token') == 'theredpin') {
  	res.send(req.param('hub.challenge'));
  } else {
	res.send('Hello World!');
  }
});

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

  for (var change in changes) {
  	console.log('change.field: ' + change.field);
  }

  res.send('yay');
}); 

/*
app.get('/SubscribeFacebookPage', function(req, res) {
	res.render('/index'); 
});*/

app.listen( process.env.PORT || 5000, function() {
  console.log('Node app is running on port', process.env.PORT);
});
