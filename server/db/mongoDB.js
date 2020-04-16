const mongoose = require('mongoose');

const install = require('./install.js');

const setup = async () => {
	await install();
};

if (!process.env.MONGO_URI) {
	setup();
} else {
	mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false
	}).catch(error => {
		throw new Error(error);
	});
	// console.log('Netvis connected!');
}