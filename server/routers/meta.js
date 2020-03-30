/* eslint-disable no-prototype-builtins */
const express = require('express');

const auth = require('../middleware/auth');
const Meta = require('../models/meta');

const router = new express.Router();
router.use(express.json());

router.get('/:prop', async (req, res) => {
	const meta = await Meta.findOne()
		.catch( (error) => {
            console.log(error);
            res.status(400).send(error);
        });

    //if not all or prop doesn't exist
    if (req.params.prop !== 'all' && meta[req.params.prop] === undefined) return res.status(400).send('Property not found');
    
    if(req.params.prop !== 'all') {
        res.status(200).send(meta[req.params.prop]);
    } else {
        res.status(200).send(meta);
    }
});

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

router.patch('/', auth, async (req, res) => {
	const updates = Object.keys(req.body);

	try {
        const meta = await Meta.findOne()
            .catch( (error) => {
                console.log(error);
                res.status(400).send(error);
            });

        updates.forEach((update) => meta[update] = req.body[update]);
        await meta.save();

		res.send(meta);

	} catch (error) {
		res.status(400).send(error);
	}
});

router.delete('/:prop', auth, async (req, res) => {
	try {
        const meta = await Meta.findOne()
            .catch( (error) => {
                console.log(error);
                res.status(400).send(error);
            });
        
        //remove property;
        const newMeta =  meta.toObject();
        delete newMeta[req.params.prop];

        await meta.overwrite(newMeta);
        await meta.save();

		res.send(meta);

	} catch (error) {
		res.status(400).send(error);
	}
});

module.exports = router;