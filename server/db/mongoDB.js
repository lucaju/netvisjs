
const mongoose = require('mongoose');

let mongoURI = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`;

const connect = async (credentials) => {

	//check credentials
	if (!process.env.MONGODB_HOST
        || !process.env.MONGODB_PORT
		|| !process.env.MONGODB_DATABASE) {

		if (!credentials) {
			throw new Error('Redirect to install');
		}
    } 

	//check overwrite credentials
	if (credentials) {
		mongoURI = `mongodb://${credentials.host}:${credentials.port}/${credentials.database}`;
	} else {
		mongoURI = `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_DATABASE}`;
	}

	//connect
	await mongoose.connect(mongoURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false
	}).catch(error => {
		throw new Error(error);
	});

	return true;	
};

const close = async () => await mongoose.connection.close();

module.exports = {
	connect,
	close
};