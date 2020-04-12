const fs = require('fs-extra');
const mongoDB = require('../../db/mongoDB');
const Meta = require('../../models/meta');
const User = require('../../models/user');
const {sendWelcomeEmail} = require('../../emails/account');


const install = async credentials => {

    const jwt_token_secret = '19ma7mYU1pNhJM8p6zSyqI1MsOfH4CM7aHnICI1N35FsoeHyupTdULqBSPztzE8';

    //A. ENV FILE
    const env = `
#MONGODB
MONGODB_HOST=${credentials.mongoDB.host}
MONGODB_PORT=${credentials.mongoDB.port}
MONGODB_DATABASE=${credentials.mongoDB.database}

#SENDGRID
SENDGRID_API_KEY=${credentials.meta.sendgridAPI}

#JWT_TOKEN_SECRET
JWT_SECRET=${jwt_token_secret}`;

    await fs.writeFile('./config/.env', env)
        .catch(() => {
            throw new Error('Installation failed.');
        });


    //B. UPDATE proceprocess.env
    process.env.MONGODB_HOST = credentials.mongoDB.host;
    process.env.MONGODB_PORT = credentials.mongoDB.port;
    process.env.MONGODB_DATABASE = credentials.mongoDB.database;
    process.env.SENDGRID_API_KEY = credentials.meta.sendgridAPI;
    process.env.JWT_SECRET = jwt_token_secret;


    //C. Connect MongoDB
    await mongoDB.connect();


    //D. METADATA
    const meta = new Meta({
        title: credentials.meta.title,
        url: credentials.meta.url,
        email: credentials.user.email
    });

    await meta.save()
        .catch(async error => {
            await eraseENV();
            throw new Error(error);
        });

    //E. ADMIN USER
    const user = new User({
        firstName: 'admin',
        email: credentials.user.email,
        password: credentials.user.password,
        level: 0
    });

    await user.save()
        .catch(async error => {
            await eraseENV();
            throw new Error(error);
        });

    //create password token
    const pwdToken = await user.generatePwdToken();

    // send email.
    await sendWelcomeEmail({
        _id: user.id,
        email: user.email,
        name: user.fullName(),
        pwdToken
    });

    return meta;
};

const eraseENV = async () => await fs.writeFile('config/.env', '');

module.exports = install;