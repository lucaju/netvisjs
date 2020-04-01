const express = require('express');

const auth = require('../middleware/auth');
const Meta = require('../models/meta');

const router = new express.Router();
router.use(express.json());


/**
 * GET Meta Property
 * 
 * @async
 * @function
 * @param {String} req.params.prop Matches  meta[prop] : Use 'all' to show all
 * @returns {Mixin} res.body - A meta Property or an array os properties
 * @example
 * get/title
 */
router.get('/:prop', async (req, res) => {
	const meta = await Meta.findOne()
		.catch( (error) => {
            console.log(error);
            res.status(400).send(error);
        });

    //if not all or prop doesn't exist
    if (req.params.prop !== 'all' && meta[req.params.prop] === undefined) {
        return res.status(400).send('Property not found');
    }
    
    if(req.params.prop !== 'all') {
        res.status(200).send(meta[req.params.prop]);
    } else {
        res.status(200).send(meta);
    }
});

/**
 * PORT Meta Property
 * 
 * @async
 * @function
 * @param {Object} req.body Properties 
 * @param {String} req.body.install flag installation process required to create properties on Meta document
 * @returns {Object} res.body - Meta properties
 * @example
 * post/
 * {
 *  install: true,
 *  title: 'title'
 * }
 */
router.post('/', async (req, res) => {
    try {
        if (!req.body.install) throw new Error(); 
        delete req.body.install;

        const meta = new Meta(req.body);
        await meta.save();
        
        res.status(201).send(meta);

    } catch (error) {
        res.status(400).send(error);
	}
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