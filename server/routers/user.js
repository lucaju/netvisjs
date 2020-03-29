require('dotenv').config();
const express = require('express');
const {DateTime} = require ('luxon');
// const util = require('util');
// const chalk = require('chalk');
const auth = require('../middleware/auth');
const User = require('../models/user');

const mongoose = require('mongoose');

const router = new express.Router();
router.use(express.json());

router.get('/', auth, async (req, res) => {
	const users = await User.find().sort({firstName: 'asc'})
		.catch( (error) => {
			console.log(error);
		});
	res.send(users);
});

router.get('/:id', auth, async (req, res) => {

	//if cuurrent user
	if (req.params.id === 'me') res.send(req.user);

	//any other user
	const userID = mongoose.Types.ObjectId(req.params.id);
	const user = await User.findById(userID)
		.catch( (error) => {
			console.log(error);
		});
	res.send(user);
});

router.post('/', async (req, res) => {
	const user = new User(req.body);
    try {
		await user.save();
		// sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
	}
});

router.patch('/:id', auth, async (req, res) => {

	const updates = Object.keys(req.body);
	const allowedUpdates = ['firstName', 'lastName', 'email', 'password', 'level'];
	const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

	const passwordUpdate = allowedUpdates.find( type => type === 'password');

	if (!isValidOperation) {
		return res.status(400).send({ error: 'Invalid updates!' });
	}

	try {
		let user;
		if (req.params.id === 'me') {
			//if cuurrent user
			user = req.user;
		} else {
			const userID = mongoose.Types.ObjectId(req.params.id);
			user = await User.findById(userID);
		}

		updates.forEach((update) => user[update] = req.body[update]);
		if (passwordUpdate) user.tokens = [];

		await user.save();
		res.send(user);

	} catch (error) {
		res.status(400).send(error);
	}
});

router.delete('/:id', auth, async (req, res) => {

	try {
		let user;
		if (req.params.id === 'me') {
			//if cuurrent user
			user = req.user;
		} else {
			const userID = mongoose.Types.ObjectId(req.params.id);
			user = await User.findById(userID);
		}

		await User.deleteOne({_id: user.id});
		// sendCancelationEmail(req.user.email, req.user.name)

		res.send(user);

	} catch (e) {
		res.status(500).send();
	}

});

router.post('/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(req.body.email, req.body.password);
		console.log(User);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

router.post('/logout', auth, async (req, res) => {
	req.user.tokens = req.user.tokens.filter((token) => {
		return token.token !== req.token;
	});

	await req.user.save()
		.catch(() => res.status(500).send());

	res.send();
});

router.post('/logoutAll', auth, async (req, res) => {
	req.user.tokens = [];

	await req.user.save()
		.catch(() => res.status(500).send());

	res.send();
});

router.post('/forgotPassword', async (req, res) => {
	const userEmail = req.body.email;

	const user = await User.findByEmail(userEmail)
		.catch((error) => res.status(404).send(error));

	const token = await user.generatePwdToken();
	// sendResetPasswordEmail(user.id, user.email, token)
	res.status(200).send();

});

router.get('/resetPassword/:id/:token', async (req, res) => {
	const userID = mongoose.Types.ObjectId(req.params.id);
	const passToken = req.params.token;

	//find user
	const user = await User.findById(userID)
		.catch((error) => res.status(404).send(error));

	//find token
	const passwordReset = user.passwordResetTokens.find( pr => {
		if (pr.token === passToken && pr.used === false) return pr;
	});

	//Token not found or already used
	if (passwordReset === undefined) return res.status(404).send('Token expired or not found');

	//Token expires in X days
	const now = DateTime.utc();
	const tokenDate = DateTime.fromJSDate(passwordReset.date);
	const diffInDays = now.diff(tokenDate, 'days');

	if (diffInDays.toObject().days > 5) return res.status(406).send('Token expired');

	//ok, mark token as used
	await user.usePwdToken(passToken);

	//pass user indo to the interface
	res.status(200).send({user});
});

module.exports = router;