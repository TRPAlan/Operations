var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 

//console.log('LUCY IN APPLICATION');

app.use('/facebook', express.static(__dirname + '/views'));

// for authentication, our token is theredpin (go to facebook developer > webhooks )
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

  var object = req.body.object; 
  var changes = req.body.entry[0].changes; 

  console.log ('object:' + object);
  console.log ('LUCY entry[0]:' + req.body.entry[0]);
  console.log ('LUCY changes:' + req.body.entry[0].changes);
  console.log ('LUCY id:' + req.body.entry[0].id);
  console.log ('LUCY time :' + req.body.entry[0].time);
  console.log ('LUCY changes[0]:' + req.body.entry[0].changes[0]);
   console.log ('LUCY changes[0].field:' + req.body.entry[0].changes[0].field);

  for (var i=0; i< req.body.entry[0].changes.length; i++){
  	console.log('change.field: ' + req.body.entry[0].changes[i].field);
  	console.log('change.leadgenID: ' + req.body.entry[0].changes[i].value.leadgen_id);
  	console.log('change.formID: ' + req.body.entry[0].changes[i].value.form_id);
  	console.log('change.created_time: ' + req.body.entry[0].changes[i].value.created_time);
  }

  res.send('yay');
}); 

// testing making get request
var https = require('https');
var options = {
  host: 'graph.facebook.com',
  path: '/120804831263518?fields=access_token'
};

var pageAccessToken; 

var callback = function(response) {
  var str = '';
  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });
  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log(str);
    pageAccessToken = str; 
  });
};

app.get('/testing', function(req,res) {
	https.request(options, callback).end();
	var p = '/1691930984420345?access_token=' +pageAccessToken;
	var newOptions = {
		host: 'graph.facebook.com',
		path: p
	}

	https.request(newOptions, callback).end(); 
  
	res.send('hello'); 
});


/*
var url = 'https://graph.facebook.com/1691930984420345';
var request = http.get(url, function (response) {
    // data is streamed in chunks from the server
    // so we have to handle the "data" event    
    var buffer = "", 
        data,
        route;

    response.on("data", function (chunk) {
        buffer += chunk;
    }); 

    response.on("end", function (err) {
        // finished transferring data
        // dump the raw data
        console.log(buffer);
        console.log("\n");
        data = JSON.parse(buffer);

        // extract the distance and time
        console.log("full name: " + data.field_data[0].values[1]);
        console.log("email: " + data.field_data[1].values[1]);
    }); 
}); 


/*
app.get('/SubscribeFacebookPage', function(req, res) {
	res.render('/index'); 
});*/



app.listen( process.env.PORT || 5000, function() {
  console.log('Node app is running on port', process.env.PORT);
});
