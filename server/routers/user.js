const express = require('express');

const auth = require('../middleware/auth');
const User = require('../models/user');
const {
	sendWelcomeEmail,
	sendPasswordResetEmail,
	// sendCancelationEmail
} = require('../emails/account');

const router = new express.Router();
router.use(express.json());


/**
 * GET User by ID
 * 
 * @async
 * @function
 * @param {String} req.params.id Matches the user._id : 'me' refers to current user
 * @returns {Object} res.body - User
 * @example
 * get/:_id
 */
router.get('/:id', auth, async (req, res) => {
	//if cuurrent user
	if (req.params.id === 'me') res.send(req.user);

	//any other user
	const user = await User.findById(req.params.id)
		.catch(error => {
			res.status(500).send(error);
		});

	if (!user) res.status(404).send();

	res.status(200).send(user);
});

/**
 * GET Users
 * 
 * @async
 * @function
 * @returns {Object} res.body - Users Collection
 * @example
 * get/
 */
router.get('/', auth, async (req, res) => {
	const users = await User.find().sort({
			firstName: 'asc'
		})
		.catch((error) => {
			res.status(500).send(error);
		});

	if (!users) res.status(404).send();

	res.status(200).send(users);
});

/**
 * POST User
 * 
 * @async
 * @function
 * @param {Object} req.body User data
 * @returns {Object} res.body - User
 * @example
 * post/
 * {
 * 	name: name,
 * 	email: email,
 * ...
 * }
 */
router.post('/', async (req, res) => {
	try {
		const user = new User(req.body);
		await user.save();

		//create password token
		const pwdToken = await user.generatePwdToken();

		//send email.
		await sendWelcomeEmail({
			_id: user._id,
			email: user.email,
			name: user.fullName(),
			pwdToken
		});

		res.status(201).send(user);
	} catch (error) {
		res.status(400).send(error);
	}
});

/**
 * PATCH Update User
 * 
 * @async
 * @function
 * @param {String} req.params.id User id
 * @param {Object} req.body User data
 * @returns {Object} res.body - User
 * @example
 * patch/
 * {
 * 	name: name,
 * 	email: email,
 * ...
 * }
 */
router.patch('/:id', auth, async (req, res) => {

	//check valid operation
	const updates = Object.keys(req.body);
	const allowedUpdates = ['firstName', 'lastName', 'email', 'password', 'level'];
	const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

	const passwordUpdate = allowedUpdates.find(type => type === 'password');

	if (!isValidOperation) {
		return res.status(400).send({
			error: 'Invalid updates!'
		});
	}

	try {
		let user;
		if (req.params.id === 'me') {
			user = req.user; //if cuurrent user
		} else {
			user = await User.findById(req.params.id);
		}

		updates.forEach((update) => user[update] = req.body[update]);
		if (passwordUpdate) user.tokens = [];

		await user.save();
		res.status(200).send(user);

	} catch (error) {
		res.status(400).send(error);
	}
});

/**
 * DELETE User
 * 
 * @async
 * @function
 * @param {String} req.params.id User id
 * @returns {Object} res.body - User
 * @example
 * delete/:id
 */
router.delete('/:id', auth, async (req, res) => {
	try {
		let user;
		if (req.params.id === 'me') {
			user = req.user; //if cuurrent user
		} else {
			user = await User.findById(req.params.id);
		}

		//delete
		await User.deleteOne({
			_id: user.id
		});

		//send email
		// await sendCancelationEmail({
		// 	_id: user.id,
		// 	email: user.email, 
		// 	name: user.fullName(),
		// });

		res.status(200).send(user);

	} catch (e) {
		res.status(500).send();
	}
});

/**
 * POST Login
 * 
 * @async
 * @function
 * @param {String} req.body.email User email
 * @param {String} req.body.password User password
 * @returns {Object} res.body - {User, token}
 * @example
 * post/login
 * {
 * 	email: email,
 * 	password: password
 * }
 */
router.post('/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();
		res.status(200).send({
			user,
			token
		});
	} catch (e) {
		res.status(400).send();
	}
});

/**
 * POST Logout
 * 
 * @async
 * @function
 * @example
 * post/logout
 */
router.post('/logout', auth, async (req, res) => {
	//remove current token
	req.user.tokens = req.user.tokens.filter((token) => {
		return token.token !== req.token;
	});

	await req.user.save()
		.catch(() => {
			res.status(500).send();
		});

	res.status(200).send();
});

/**
 * POST Logout from everywhere
 * 
 * @async
 * @function
 * @example
 * post/logoutAll
 */
router.post('/logoutAll', auth, async (req, res) => {
	//reset tokens
	req.user.tokens = [];

	await req.user.save()
		.catch(() => {
			res.status(500).send();
		});

	res.status(200).send();
});

/**
 * POST Forgot Password
 * 
 * @async
 * @function
 * @param {String} req.body.email User email
 * @example
 * post/forgotPassword
 */
router.post('/forgotPassword', async (req, res) => {
	// find user
	const user = await User.findByEmail(req.body.email)
		.catch((error) => {
			res.status(404).send(error);
		});

	// create password token
	try {
		const pwdToken = await user.generatePwdToken();

		//send email
		await sendPasswordResetEmail({
			_id: user.id,
			email: user.email,
			name: user.fullName(),
			pwdToken
		});

		res.status(200).send();
	} catch (error) {
		res.status(500);
	}
});

module.exports = router;