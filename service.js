var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
  if (req.param.hub.challenge) res.send(req.param.hub.challenge);
});

app.post('/', function (req, res) {
  res.send('Got a POST request');
});
