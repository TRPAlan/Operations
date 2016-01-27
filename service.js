var express = require('express');
var app = express();

console.log('LUCY IN APPLICATION');

app.get('/', function (req, res) {
	console.log('LUCY IN GET');
  res.send('Hello World!');
  //if (req.param.hub.challenge) res.send(req.param.hub.challenge);
});

app.post('/', function (req, res) {
  res.send('Got a POST request');
});
