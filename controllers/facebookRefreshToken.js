exports.get = function (req, res) {
	res.render('facebookRefreshToken', 
		{appID: proccess.env.FACEBOOK_APP_ID, 
		appSecret: process.env.FACEBOOK_APP_SECRET} ); 

	var oldToken = req.body.tempToken; 

	res.send('Success');
};