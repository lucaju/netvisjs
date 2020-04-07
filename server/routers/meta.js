const express = require('express');

const mongoDB = require('../db/mongoDB');
const auth = require('../middleware/auth');
const Meta = require('../models/meta');
const install = require ('./util/install');

const router = new express.Router();
router.use(express.json());


/**
 * POST COONECT MONGO DB
 * 
 * @async
 * @function
 * @param {String} req.body.db.host host ip
 * @param {String} req.body.db.port port 
 * @param {String} req.body.db.database Name of database 
 * @example
 * post/
 * {
 *  db: {
 *   host: '127.0.0.1',
 *   port: '27017',
 *   database: 'netvisjs'
 *  }
 * }
 */
router.post('/connect', async (req, res) => {

    //missing data
    if (!req.body.db.host || !req.body.db.port || !req.body.db.database) {
        res.status(400).send({
            message: 'Connection failed. Data Incomplete.'
        });
    }

    //connect with provived credentials
    await mongoDB.connect({
        host: req.body.db.host,
        port: req.body.db.port,
        database: req.body.db.database
    }).catch(error => {
        res.status(500).send({
            message: 'Connection failed.',
            error: error
        });
    });

    await mongoDB.close();
    
    res.status(200).send();
    
});

/**
 * POST INSTALL NETVIS
 * 
 * @async
 * @function
 * @param {String} req.body.db.host host ip
 * @param {String} req.body.db.port port 
 * @param {String} req.body.db.database Name of database 
 * @param {String} req.body.user.emails admin email
 * @param {String} req.body.user.password admin password
 * @param {String} req.body.meta.title Website title 
 * @param {String} req.body.meta.sendgridAPI sendgrid API
 * @returns {Object} res.body.metadata - Website meta information
 * @example
 * post
 * {
 *  db: {
 *   host: '127.0.0.1',
 *   port: '27017',
 *   database: 'netvisjs'
 *  },
 *  user: {
 *   emails: 'user@email.com',
 *   password: '****',
 *  },
 *  meta: {
 *   title: NetVis,
 *   sendgridAPI: '######',
 *  }
 * }
 */
router.post('/install', async (req, res) => {

    //A. ALREADY INSTALLED
    if (process.env.MONGODB_HOST && process.env.MONGODB_PORT && process.env.MONGODB_DATABASE) {
        return res.status(400).send({
            message: 'NetVis is already installed!'
        });
    }

    //B. CHECK DATA
    if (!req.body.db.host ||
        !req.body.db.port ||
        !req.body.db.database ||
        !req.body.user.email ||
        !req.body.user.password ||
        !req.body.meta.title ||
        !req.body.meta.sendgridAPI) {
        
        return res.status(400).send({
            message: 'Connection failed. Data Incomplete.'
        });
    }

    //C. Current url
    req.body.url = `${req.protocol}://${req.hostname}`;

    //D. install
    const metadata = await install(req.body)
        .catch(error => {
            res.status(500).send({
                message: 'Installation failed.',
                error
            });
        });

    //E. Response
    res.status(201).send({
        title: metadata.title,
        url: metadata.url,
        email: metadata.email
    });
});


/**
 * GET Meta Properties
 * 
 * @async
 * @function
 * @returns {Object} res.body - Meta Properties
 * @example
 * get/title
 */
router.get('/', async (req, res) => {
	const meta = await Meta.findOne()
		.catch( (error) => {
            res.status(400).send(error);
        });

    res.status(200).send(meta);
});

/**
 * GET Meta Property
 * 
 * @async
 * @function
 * @param {String} req.params.prop Matches  meta[prop]
 * @returns {Object} res.body - A meta Property
 * @example
 * get/title
 */
router.get('/:prop', async (req, res) => {
	const meta = await Meta.findOne()
		.catch( (error) => {
            res.status(400).send(error);
        });

    // if not all or prop doesn't exist
    if (meta[req.params.prop] === undefined) {
        return res.status(400).send('Property not found');
    }
    
    res.status(200).send(meta[req.params.prop]);
});

/**
 * POST Meta Property
 * 
 * @async
 * @function
 * @param {Object} req.body Properties 
 * @returns {Object} res.body - Meta properties
 * @example
 * post/
 * {
 *  title: 'title'
 * }
 */
router.post('/', async (req, res) => {
    const meta = new Meta(req.body);
    await meta.save()
        .catch(error => {
            res.status(400).send(error);
        });
    res.status(201).send(meta);
});

/**
 * PATCH Update Meta Properties
 * 
 * @async
 * @function
 * @param {Object} req.body Properties 
 * @returns {Object} res.body - Meta properties
 * @example
 * patch/
 * {
 *  title: 'title'
 * }
 */
router.patch('/', auth, async (req, res) => {
	const updates = Object.keys(req.body);

	try {
        const meta = await Meta.findOne();

        updates.forEach((update) => meta[update] = req.body[update]);
        await meta.save();

		res.status(200).send(meta);

	} catch (error) {
		res.status(400).send(error);
	}
});


/**
 * Delete Meta Property
 * 
 * @async
 * @function
 * @param {Object} req.params.prop Meta Property 
 * @returns {Object} res.body - Meta properties
 * @example
 * delete/title
 */
router.delete('/:prop', auth, async (req, res) => {
	try {
        const meta = await Meta.findOne();
        
        //remove property;
        const newMeta =  meta.toObject();
        delete newMeta[req.params.prop];

        await meta.overwrite(newMeta);
        await meta.save();

		res.status(200).send(meta);

	} catch (error) {
		res.status(400).send(error);
	}
});

module.exports = router;