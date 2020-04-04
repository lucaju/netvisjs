const bodyParser = require('body-parser');
const express = require('express');

const mongoDB = require('./db/mongoDB');
const meta = require('./routers/meta');
const user = require('./routers/user');
const node = require('./routers/node');

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json()); // support json encoded bodies

app.use(express.static('dist'));
app.use('/assets', express.static(__dirname + '/dist/assets'));

//routers
app.use('/meta',meta);
app.use('/users',user);
app.use('/nodes',node);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error('Not  Found');
	err.status = 404;
	next(err);
});

app.listen(port, async () => {

	//commect MongoDB
	// await mongoDB.connect()
	// 	.catch( error => {
	// 		console.log(error);
	// 	});

	console.log(`App listening on port ${port}!`);
});