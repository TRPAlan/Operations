exports.post = function (req, res) {
	console.log(req.body);
	res.send('SUCCESS');
};

exports.get = function (req, res)  {
	console.log (req.body);
	res.send('SUCCESS');
}