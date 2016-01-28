var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

//console.log('LUCY IN APPLICATION');

app.use('/facebook', express.static(__dirname + '/views'));

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
  res.send('yay');
}); 

/*
app.get('/SubscribeFacebookPage', function(req, res) {
	res.render('/index'); 
});*/

app.listen( process.env.PORT || 5000, function() {
  console.log('Node app is running on port', process.env.PORT);
});
