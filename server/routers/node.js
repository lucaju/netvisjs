const express = require('express');
const mongoose = require('mongoose');

const auth = require('../middleware/auth');
const Node = require('../models/node');


const router = new express.Router();
router.use(express.json());

router.post('/', auth, async (req, res) => {
    const node = new Node(req.body);
    await node.save()
        .catch(error => res.status(400).send(error));
        
    res.status(201).send(node);
});

router.get('/:id', auth, async (req, res) => {
    const nodeID = mongoose.Types.ObjectId(req.params.id);

    const node = await Node.findById(nodeID)
        .catch (() => res.status(500).send());

    if (!node) return res.status(404).send();

    await Node.populate(node,{
        path: 'relations',
        select: ['name','type','relations'],
        model: 'Node'
    });

    res.send(node);
});

router.get('/type/:type', auth, async (req, res) => {
    const node = await Node.find({type: req.params.type})
        .catch (() => res.status(500).send());

    if (!node) return res.status(404).send();

    res.status(200).send(node);
});

// GET /?id=_id
// GET /?name=name
// GET /?type=type
// GET /?limit=10&skip=20
router.get('/', auth, async (req, res) => {

    const match = {};

    if (req.query.id) match.id = mongoose.Types.ObjectId(req.query.id);
    if (req.query.name) match.name = req.query.name;
    if (req.query.type) match.type = req.query.type;

    const nodes = await Node.find(
        match,
        null,
        {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
        }
    ).catch (() => res.status(500).send());

    if (!nodes) return res.status(404).send();

    if (req.query.name) {
        for (const node of nodes) {
            await Node.populate(node,{
                path: 'relations',
                select: ['name','type','relations'],
                model: 'Node'
            });
        }
    }

    res.status(200).send(nodes);

});

router.patch('/:id', auth, async (req, res) => {

    //params
    const nodeID = mongoose.Types.ObjectId(req.params.id);
    const updates = Object.keys(req.body);

    //fetch node
    const node = await Node.findById(nodeID)
        .catch (() => res.status(500).send());
    
    //not found
    if (!node) return res.status(404).send();

    try {

        //If relations to remove
        if (req.body.relationsToRemove) {
            //filter out 
            node.relations = node.relations.filter( rel => {
                if (!req.body.relationsToRemove.includes(rel.toString())) return rel;
            });

            //delete attribute to avoid conflict
            delete req.body.relationsToRemove;
        }

        //if relations to add
        if (req.body.relationsToAdd) {
            //check for duplications
            req.body.relationsToAdd = req.body.relationsToAdd.filter( rel => {
                if (!node.relations.includes(rel)) return rel;
            });
        
            //add 
            node.relations = [...node.relations, ...req.body.relationsToAdd];
            
            //delete attribute to avoid conflict
            delete req.body.relationsToAdd;
        }

        //update other attributes 
        updates.forEach((update) => node[update] = req.body[update]);
        await node.save();

        res.send(node);

    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete('/:id', auth, async (req, res) => {

    const nodeID = mongoose.Types.ObjectId(req.params.id);

    const node = await Node.findById(nodeID)
        .catch (() => res.status(500).send());

    if (!node) res.status(404).send();
    
    //remove reference on other nodes
    //use $pull to remove one iten in a array
    const relationships = await Node.updateMany({
        relations: {
            _id: nodeID
        }},{
            $pull: { relations: nodeID}
        });

    //remove node
    await node.remove()
        .catch( () => res.status(500).send());
   
    res.status(200).send({
        action: 'delete',
        target: node,
        relations: relationships.nModified
    });
});

module.exports = router;