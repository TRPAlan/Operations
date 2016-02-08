var mongoose = require('mongoose');

var leadSchema = new mongoose.Schema({
	email: { type: String, unique: true },
	phone: String,
	firstName: String,
	lastName: String,
	Name: String,
	formId: String
}); 

// defining custom methods
leadSchema.methods.example = function () {

}; 

leadSchema.pre('save', function(next) {
	// do some logic before saving lead
	next(); 
}); 

var Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;