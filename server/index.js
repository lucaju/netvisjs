const app = require('./app');
const mongoDB = require('./db/mongoDB');
const port = process.env.PORT || 3000;


app.listen(port, async () => {

	// connect MongoDB
	await mongoDB.connect()
		.catch(() => {
			console.log('NetVis need to be installed!');
		});

	console.log(`App listening on port ${port}!`);
});