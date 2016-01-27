var express = require('express');
var app = express();

//console.log('LUCY IN APPLICATION');

app.get('/', function (req, res) {
 // res.send('Hello World!');
  if (req.param.hub.challenge) res.send(req.param.hub.challenge);
});

app.post('/', function (req, res) {
  res.send('Got a POST request');
}); 

app.listen( process.env.PORT || 5000, function() {
  console.log('Node app is running on port', process.env.PORT || 5000);
});
