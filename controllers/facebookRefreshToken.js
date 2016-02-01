exports.get = function (req, res) {
	if (req.param('verify_token') == (process.env.VERIFY_TOKEN)) {
		var newToken = req.param('new_page_token'); // store this variable in the db
		res.send('SUCCESS');
	} else {
		res.send('FAILURE, wrong verify_token');
	}
};