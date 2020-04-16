const express = require('express');

const auth = require('../middleware/auth');
const Meta = require('../models/meta');

const router = new express.Router();
router.use(express.json());


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
        .catch((error) => {
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
    const prop = req.params.prop;
    const meta = await Meta.findOne()
        .catch((error) => {
            res.status(400).send(error);
        });

    // if not all or prop doesn't exist
    if (meta[prop] === undefined) {
        return res.status(400).send('Property not found');
    }

    res.status(200).send({
        [prop]: meta[prop]
    });
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
router.post('/', auth, async (req, res) => {

    const properties = Object.keys(req.body);

    try {
        const meta = await Meta.findOne();

        const newMeta = meta.toObject();

        properties.forEach((prop) => newMeta[prop] = req.body[prop]);
        await meta.overwrite(newMeta);
        await meta.save();

        res.status(200).send(meta);

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
        const newMeta = meta.toObject();
        delete newMeta[req.params.prop];

        await meta.overwrite(newMeta);
        await meta.save();

        res.status(200).send(meta);

    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;