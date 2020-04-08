const bodyParser = require('body-parser');
const express = require('express');

const mongoDB = require('./db/mongoDB');
const meta = require('./routers/meta');
const user = require('./routers/user');
const node = require('./routers/node');
const reset = require('./routers/reset');

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json()); // support json encoded bodies

//routers
app.use('/meta', meta);
app.use('/users', user);
app.use('/nodes', node);
app.use('/reset', reset);

app.use('/', express.static('dist'));

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error('Not  Found');
	err.status = 404;
	next(err);
});

app.listen(port, async () => {

	// connect MongoDB
	await mongoDB.connect()
		.catch(() => {
			console.log('NetVis need to be install!');
		});

	console.log(`App listening on port ${port}!`);
});