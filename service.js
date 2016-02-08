// module dependencies
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

// body parser
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

// View Configuration 
app.set('view engine', 'jade');

// Controllers (route handlers)
var facebookLeadGenController = require('./controllers/facebookLeadGen');
var marketoLeadGenController = require('./controllers/marketoLeadGen');
var testingEndPointController = require('./controllers/testingEndPoint');
var houseDetailController = require('./controllers/houseDetailHtmlGen');
var valuePropsController = require('./controllers/valueProps');

// Database
mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});


// FacebookLeadGen
app.get('/FacebookLeadGen', facebookLeadGenController.get);
app.post('/FacebookLeadGen', facebookLeadGenController.post); 

// MarketoLeadGen
app.get('/MarketoLeadGen', marketoLeadGenController.get);
app.post('/MarketoLeadGen', marketoLeadGenController.post); 

// TestingEndPoint
app.post('/testingEndPoint', testingEndPointController.post);
app.get('/testingEndPoint', testingEndPointController.get);

// HouseDetailHtmlGen
app.get('/houseDetailHtmlGen', houseDetailController.get);

// valueProps
app.get('/valueProps', valuePropsController.get);


app.listen( process.env.PORT || 5000, function() {
  console.log('Node app is running on port', process.env.PORT);
});

