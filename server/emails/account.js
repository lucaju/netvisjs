const sgMail = require('@sendgrid/mail');

const Meta = require('../models/meta');
const {welcomeEmail,passwordResetEmail} = require('./email-composer');


const getMeta = async () => {

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const meta = await Meta.findOne()
        .catch((error) => {
            throw new Error(error);
        });

    return meta;
};

const sendWelcomeEmail = async (user) => {

    try {
        const meta = await getMeta()
            .catch((error) => {
                throw new Error(error);
            });

        const message = await welcomeEmail(meta, user);

        return await sgMail.send({
            to: `${user.name} <${user.email}>`,
            from: `${meta.title} <${meta.email}>`,
            subject: `Invitation to ${meta.title}`,
            html: message
        });

    } catch (error) {
        throw new Error(error);
    }

};

const sendPasswordResetEmail = async (user) => {

    try {
        const meta = await getMeta()
            .catch((error) => {
                throw new Error(error);
            });

        const message = await passwordResetEmail(meta, user);

        return await sgMail.send({
            to: `${user.name} <${user.email}>`,
            from: `${meta.title} <${meta.email}>`,
            subject: `${meta.title} - Password Reset.`,
            html: message
        });

    } catch (error) {
        throw new Error(error);
    }

};

const sendCancelationEmail = async (user) => {

    try {
        const meta = await getMeta()
            .catch((error) => {
                throw new Error(error);
            });

        return await sgMail.send({
            to: `${user.name} <${user.email}>`,
            from: `${meta.title} <${meta.email}>`,
            subject: `${meta.title} is sorry to see you go!`,
            text: `Goodbye, ${user.name}. I hope to see you back sometime soon.`
        });

    } catch (error) {
        throw new Error(error);
    }

};

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail,
    sendPasswordResetEmail
};