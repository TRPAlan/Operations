
// module dependencies
var express = require('express');
var mongoose = require('mongoose');
var app = express();

// Controllers (route handlers)
var facebookLeadGenController = require('./controllers/facebookLeadGen');

// BODY PARSER
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

// MONGODB CONNECT
mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

// SERVE STATIC PAGES
app.use('/facebook', express.static(__dirname + '/views')); 

// GET: FacebookLeadGen
app.get('/FacebookLeadGen', facebookLeadGenController.getFacebookLeadGen);

// POST: FacebookLeadGen
app.post('/FacebookLeadGen', facebookLeadGenController.postFacebookLeadGen); 


app.get('/testing', facebookLeadGenController.postFacebookLeadGen);


/*
app.get('/SubscribeFacebookPage', function(req, res) {
	res.render('/index'); 
});*/

/*
function SFLead() {
	this.setName = function(name) {
		this.name = name; 
	};
	this.setEmail = function(email){
		this.email = email;
	}
	this.setPhone = function (phone){
		this.phone = phone; 
	}
}*/


app.listen( process.env.PORT || 5000, function() {
  console.log('Node app is running on port', process.env.PORT);
});

