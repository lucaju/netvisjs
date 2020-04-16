const chalk = require('chalk');
const mongoose = require('mongoose');

const Meta = require('../models/meta');
const User = require('../models/user');

const config = require('../../config/config.json');


const install = async () => {

    console.log(chalk.yellow('Setup Netvis'));

    //A. Add enviroment variables
    addEnvVar();

    //B. setup MongoDB
    const mongoCredentials = (process.env.MONGODB_ROOT_USERNAME && process.env.MONGODB_ROOT_PASSWORD) ? `${process.env.MONGODB_ROOT_USERNAME}:${process.env.MONGODB_ROOT_PASSWORD}@` : '';
    const mongoServer = `${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}`;
    const mongoDB = `/${process.env.MONGODB_DATABASE}`;

    process.env.MONGO_URI = `mongodb://${mongoCredentials}${mongoServer}${mongoDB}?authSource=admin`;


    //C. Connect MongoDB
    let connectionCoolDown = 3000;
    let connectionAttempts = 0;
    let connected = false;

    while (!connected && connectionAttempts < 10) {
        console.log(`Attempt to connect to MongoDB: ${connectionAttempts}`);
        await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false
            }).then(() => connected = true)
            .catch(() => connectionAttempts++);

        await waitToReconnect(connectionAttempts * connectionCoolDown);
    }

    //D. Check innitial data
    // if initial is already recorded
    const dbREady = await checkInitData();
    if (dbREady) {
        console.log(chalk.green('Netvis Ready!'));
        return;
    }

    console.log(chalk.blue(' - Installing Netvis!'));

    console.log('   - Adding metadata');

    //E. METADATA
    const meta = new Meta({
        title: config.meta.title,
        url: config.meta.url,
        email: config.user.email
    });

    await meta.save()
        .catch(() => {
            throw new Error();
        });

    console.log('   - Adding admin user');


    //F. ADMIN USER
    const user = new User({
        firstName: config.user.firstName,
        lasttName: config.user.lasttName,
        email: config.user.email,
        password: config.user.password,
        level: 0
    });

    await user.save()
        .catch(() => {
            throw new Error();
        });

    //G. Close connection
    // await mongoose.connection.close();

    console.log(chalk.green('Netvis Installed and Ready!'));

    return;

};

const waitToReconnect = async ms => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

const addEnvVar = () => {

    process.env.MONGODB_HOST = config.mongoDB.host;
    process.env.MONGODB_PORT = config.mongoDB.port;

    if (config.mongoDB.rootUser && config.mongoDB.rootUser !== '') process.env.MONGODB_ROOT_USERNAME = config.mongoDB.rootUser;
    if (config.mongoDB.rootPWD && config.mongoDB.rootPWD !== '') process.env.MONGODB_ROOT_PASSWORD = config.mongoDB.rootPWD;

    process.env.MONGODB_DATABASE = config.mongoDB.database;

    process.env.SENDGRID_API_KEY = config.meta.sendgripdAPI;
    process.env.JWT_SECRET = config.meta.jwtSecret;

    console.log(chalk.blue(' - Setup enviroment'));
};

const checkInitData = async () => {
    let installed = true;

    //check if Meta is saved
    await Meta.findOne().catch(() => installed = false);
    //check if admin user exists
    await User.findByEmail(config.user.email).catch(() => installed = false);

    return installed;
};


module.exports = install;