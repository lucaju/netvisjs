const express = require('express');
const {DateTime} = require('luxon');

const User = require('../models/user');
const Meta = require('../models/meta');

const router = new express.Router();
router.use(express.json());

/**
 * POST request reset password
 * 
 * @async
 * @function
 * @param {String} req.query._id User id
 * @param {String} req.query.action ['create','reset']
 * @param {String} req.query.token User pwdToken
 * @returns {Object} res.body - Meta and User
 * @example
 * post/request?_id=xxx&action=reset&token=xxxx
 */
router.get('/request', async (req, res) => {

    ///get meta
    const meta = await Meta.findOne()
        .catch((error) => {
            res.status(500).send(error);
        });

    // find user
    const user = await User.findById(req.query._id)
        .catch((error) => {
            res.status(404).send(error);
        });

    //find token
    const passwordReset = user.passwordResetTokens.find(pr => {
        if (pr.token === req.query.token && pr.used === false) return pr;
    });

    //Token not found or already used
    if (passwordReset === undefined) {
        return res.status(400).send({
            status: 'Error',
            message: 'Token expired or not found'
        });
    }

    //Token expires in X days
    const now = DateTime.utc();
    const tokenDate = DateTime.fromJSDate(passwordReset.date);
    const diffInDays = now.diff(tokenDate, 'days');

    //if tokens has more than 5 days
    if (diffInDays.toObject().days > 5) {
        return res.status(400).send({
            status: 'Expired',
            message: 'Token expired'
        });
    }

    //ok, mark token as used
    await user.usePwdToken(req.query.token);

    //pass user info to the interface
    res.status(200).send({
        meta: {
            title: meta.title,
            url: meta.url
        },
        user: {
            _id: user._id,
            name: user.fullName(),
            email: user.email
        }
    });

});

/**
 * POST Reset Password
 * 
 * @async
 * @function
 * @param {String} req.body._id User id
 * @param {String} req.body.password User new password
 * @example
 * post/reset
 */
router.post('/reset', async (req, res) => {
    try {
        const user = await User.findById(req.body._id);
        user.password = req.body.password;
        user.tokens = [];
        await user.save();
        res.status(200).send();
    } catch (error) {
        res.status(500).send();
    }
});

module.exports = router;