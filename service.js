var express = require('express');
var app = express();

//console.log('LUCY IN APPLICATION');

app.get('/', function (req, res) {
  res.send('Hello World!');
  //res.render('index');
  //if (req.param.hub.challenge) res.send(req.param.hub.challenge);
});

app.post('/', function (req, res) {
  res.send('Got a POST request');
}); 

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});