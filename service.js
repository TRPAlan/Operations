var express = require('express');
var app = express();

console.log('LUCY IN APPLICATION');

app.get('/app', function (req, res) {
  console.log('LUCY IN GET');
  res.send('Hello World!');
  //if (req.param.hub.challenge) res.send(req.param.hub.challenge);
});

app.post('/app', function (req, res) {
  res.send('Got a POST request');
});
