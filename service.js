var express = require('express');
var app = express();

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
  res.send('Got a POST request');
}); 

/*
app.get('/SubscribeFacebookPage', function(req, res) {
	res.render('/index'); 
});*/

app.listen( process.env.PORT || 5000, function() {
  console.log('Node app is running on port', process.env.PORT);
});
