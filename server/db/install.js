const chalk = require('chalk');
const mongoose = require('mongoose');

const Meta = require('../models/meta');
const User = require('../models/user');

// const config = require('../../config/config.json');


const install = async () => {

    console.log(chalk.yellow('Setup Netvis'));

    //A. setup MongoDB
    const mongoCredentials = `${process.env.MONGODB_ROOT_USERNAME}:${process.env.MONGODB_ROOT_PASSWORD}`
    const mongoServer = `${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}`;
    const mongoDB = `${process.env.MONGODB_DATABASE}`;

    // process.env.MONGO_URI = `mongodb://${mongoCredentials}${mongoServer}${mongoDB}?authSource=admin`;
    process.env.MONGO_URI = `mongodb://${mongoCredentials}@142.132.164.59:${process.env.MONGODB_PORT}/${mongoDB}?authSource=admin`
    console.log(process.env.MONGO_URI)

    //B. Connect MongoDB
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

    //C. Check innitial data
    // if initial is already recorded
    const dbREady = await checkInitData();
    if (dbREady) {
        console.log(chalk.green('Netvis Ready!'));
        return;
    }

    //D. Check innitial data
    console.log(chalk.blue(' - Installing Netvis!'));

    console.log('   - Adding metadata');

    const meta = new Meta({
        title: process.env.META_TITLE,
        url: process.env.META_URL,
        email: process.env.ADMIN_EMAIL
    });

    await meta.save()
        .catch(() => {
            throw new Error();
        });

    console.log('   - Adding admin user');

    const user = new User({
        firstName: process.env.ADMIN_FIRST_NAME,
        lasttName: process.env.ADMIN_LAST_NAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PWD,
        level: 0
    });

    await user.save()
        .catch(() => {
            throw new Error();
        });

    //E. Close connection
    // await mongoose.connection.close();

    console.log(chalk.green('Netvis Installed and Ready!'));

    return;

};

const waitToReconnect = async ms => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

const checkInitData = async () => {
    let installed = true;

    //check if Meta is saved
    await Meta.findOne().catch(() => installed = false);
    //check if admin user exists
    await User.findByEmail(process.env.ADMIN_EMAIL).catch(() => installed = false);

    return installed;
};


module.exports = install;