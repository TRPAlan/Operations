var express = require('express');
var app = express();

//console.log('LUCY IN APPLICATION');

app.get('/', function (req, res) {

  if (req.param('hub.challenge')) {
  	res.send(req.param('hub.challenge'));
  } else {
	res.send('Hello World!');
  }

});

app.post('/', function (req, res) {
  res.send('Got a POST request');
}); 

app.listen( process.env.PORT || 5000, function() {
  console.log('Node app is running on port', process.env.PORT);
});
