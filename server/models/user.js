const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {DateTime} = require('luxon');
const mongoose = require('mongoose');
const validator = require('validator');


const userSchema = mongoose.Schema({
	firstName: {
		type: String,
		required: true,
		trim: true
	},
	lastName: {
		type: String,
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
	password: {
		type: String,
		required: true,
		minlength: 7,
		trim: true,
		validate(value) {
			if (value.toLowerCase().includes('password')) {
				throw new Error('Password cannot contain "password"');
			}
		}
	},
	level: {
		type: Number,
		default: 2,
		required: true,
		trim: true
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}],
	passwordResetTokens: [{
		token: {
			type: String,
			required: true
		},
		date: {
			type: Date,
			required: true
		},
		used: {
			type: Boolean,
			required: true
		}
	}]
}, {
	timestamps: true
});

userSchema.methods.toJSON = function () {
	const user = this;
	const userObject = user.toObject();

	delete userObject.password;
	delete userObject.tokens;
	delete userObject.passwordResetTokens;

	return userObject;
};

userSchema.methods.fullName = function () {
	const user = this;
	let name = '';
	if (user.firstName) name += user.firstName;
	if (user.lasttName) name += user.lasttName;
	return name;
};

userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);

	user.tokens = user.tokens.concat({
		token
	});
	await user.save();

	return token;
};

userSchema.methods.generatePwdToken = async function () {
	const user = this;
	const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);

	const resetRequest = {
		token,
		date: DateTime.utc(),
		used: false
	};

	user.passwordResetTokens = user.passwordResetTokens.concat(resetRequest);
	await user.save();

	return token;
};

userSchema.methods.usePwdToken = async function (token) {
	const user = this;
	const passwordReset = user.passwordResetTokens.find(pr => {
		if (pr.token === token) return pr;
	});
	passwordReset.used = true;

	await user.save();
	return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({email});
	if (!user) throw new Error('Unable to login');

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) throw new Error('Unable to login');

	return user;
};

userSchema.statics.findByEmail = async (email) => {
	const user = await User.findOne({email});
	if (!user) throw new Error('User not found!');
	return user;
};

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
	const user = this;
	if (user.isModified('password')) user.password = await bcrypt.hash(user.password, 8);
	next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;