const mongoose = require('mongoose');
const validator = require('validator');


const metaSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	url: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		lowercase: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error('Email is invalid');
			}
		}
	},
	sendgridAPI: {
		type: String,
		required: true,
		trim: true,
		validate(value) {
			if (validator.isEmpty(value)) {
				throw new Error('sendgridAPI invalid');
			}
		}
	},
}, {
	timestamps: true,
	strict: false
});

const Meta = mongoose.model('Meta', metaSchema);

module.exports = Meta;