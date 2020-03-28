
const express = require('express');
const Node = require('../models/node');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/', auth, async (req, res) => {
    const node = new Node({
        ...req.body,
        // owner: req.user._id
    });

    await node.save()
        .catch( (e) => {
            res.status(400).send(e);
        });

    res.status(201).send(node);
});

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/', auth, async (req, res) => {

    // const match = {};

    const nodes = await Node.find();

	for (const node of nodes) {
		console.log(node);
	}

    res.send(nodes);

    // const match = {};
    // const sort = {};

    // try { 
    //     await req.user.populate({
    //         path: 'nodes',
    //         match,
    //         options: {
    //             limit: parseInt(req.query.limit),
    //             skip: parseInt(req.query.skip),
    //             sort
    //         }
    //     }).execPopulate();
    //     res.send(req.user.tasks);
    // } catch (e) {
    //     res.status(500).send();
    // }

});

router.get('/:id', auth, async (req, res) => {
    const _id = req.params.id;

    const node = await Node.findOne({ _id, type: req.type })
        .catch (() => {
            res.status(500).send();
        });

    if (!node) return res.status(404).send();

    res.send(node);
});

router.patch('/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'type'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const node = await Node.findOne({ _id: req.params.id});

        if (!node) return res.status(404).send();

        updates.forEach((update) => node[update] = req.body[update]);
        await node.save();
        res.send(node);

    } catch (e) {
        res.status(400).send(e);
    }
});

router.delete('/:id', auth, async (req, res) => {
    const node = await Node.findOneAndDelete({ _id: req.params.id})
        .catch( () => {
            res.status(500).send();
        });

    if (!node) res.status(404).send();

    res.send(node);

});

module.exports = router;