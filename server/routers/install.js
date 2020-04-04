const fs = require('fs-extra');
const mongoDB = require('../db/mongoDB');
const Meta = require('../models/meta');
const User = require('../models/user');


const install = async credentials => {

    //A. ENV FILE
    const env = `# MONGODB
MONGODB_HOST=${credentials.db.host}
MONGODB_PORT=${credentials.db.port}
MONGODB_DATABASE=${credentials.db.database}

#TOKENSECRET
JWT_SECRET='19ma7mYU1pNhJM8p6zSyqI1MsOfH4CM7aHnICI1N35FsoeHyupTdULqBSPztzE8`;

    await fs.writeFile('.env', env)
        .catch(() => {
            throw new Error('Installation failed.');
        });

    //B. UPDATE proceprocess.env
    process.env.MONGODB_HOST = credentials.db.host;
    process.env.MONGODB_PORT = credentials.db.port;
    process.env.MONGODB_DATABASE = credentials.db.database;
    process.env.JWT_SECRET='19ma7mYU1pNhJM8p6zSyqI1MsOfH4CM7aHnICI1N35FsoeHyupTdULqBSPztzE8';
    
    //C. Connect MongoDB
    mongoDB.connect();


    //D. METADATA
    const meta = new Meta({
        title: credentials.meta.title,
        url: credentials.url,
        email: credentials.user.email,
        sendgridAPI: credentials.meta.sendgridAPI
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


    const token = await user.generateAuthToken();
    // sendWelcomeEmail(user.email, user.name)

    return meta;
};

const eraseENV = async () => {
    await fs.writeFile('.env', '');
};

module.exports = install;