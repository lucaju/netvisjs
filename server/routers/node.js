const express = require('express');

const auth = require('../middleware/auth');
const Node = require('../models/node');
const utilities = require('./util/import-nodes');


const router = new express.Router();
router.use(express.json());


/**
 * GET Node by ID
 * 
 * @async
 * @function
 * @param {String} req.params.id Matches the node._id
 * @returns {Object} res.body - A Node
 * @example
 * get/:_id
 */
router.get('/:id', auth, async (req, res) => {
    const node = await Node.findById(req.params.id)
        .catch (error => {
            res.status(500).send(error);
        });

    if (!node) return res.status(404).send();

    await Node.populate(node,{
        path: 'relations',
        select: ['name','type','relations'],
        model: 'Node'
    }).catch (() => res.status(500).send());

    res.status(200).send(node);
});

/**
 * GET Node by Type
 * 
 * @async
 * @function
 * @param {String} req.params.type Matches the node.type
 * @returns {Object} res.body - Collection of Nodes
 * @example
 * get/type/:type
 */
router.get('/type/:type', auth, async (req, res) => {
    const node = await Node.find({type: req.params.type})
        .catch (error => {
            res.status(500).send(error);
        });

    if (!node) return res.status(404).send();

    res.status(200).send(node);
});

/**
 * GET Nodes: Search
 * 
 * @async
 * @function
 * @param {String} req.query.id Matches the node._id
 * @param {String} req.query.name Matches the node.name
 * @param {String} req.query.type Matches the node.type
 * @param {String} req.query.limit Limits result
 * @param {String} req.query.skip Skip the first X nodes
 * @param {String} req.query.reldetails flag to get all relations
 * @returns {Array} res.body - Collection of Nodes
 * @example
 * get/?id=_id&name=name&type=type&limit=10&skip=20
 */
router.get('/', auth, async (req, res) => {
    const match = {};

    //query params
    if (req.query.id) match.id = req.query.id;
    if (req.query.name) match.name = RegExp(req.query.name, 'i');
    if (req.query.type) match.type = req.query.type;

    const nodes = await Node.find(
        match,
        null,
        {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
        }
    ).catch (error => {
        res.status(500).send(error);
    });

    if (!nodes) return res.status(404).send();

    //If search for a name, or the flag reldetails is true
    //Get relations' data
    if (req.query.name || req.query.reldetails === 'true') {
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

/**
 * POST Node
 * 
 * @async
 * @function
 * @param {Object} req The request
 * @param {Object} req.body The Node data
 * @param {String} req.body.name Matches the node.name (required)
 * @param {String} req.body.type Matches the node.type (required)
 * @returns {Array} res.body - New Node
 * @example
 * post/
 * {
 *  name: name,
 *  type: type,
 *  relations: {
 *  relation._id
 *  }
 * }
 */
router.post('/', auth, async (req, res) => {
    
    //check if node exists
    let node = await findNode(req.body)
        .catch (error => {
            res.status(500).send(error);
        });

    //update or update 
    if (node) {
        res.status(400).send({message: 'Node already exists'});

        //alternativelly, we could update the node
        // node = await updateNode(node,req.body)
        //     .catch(error => res.status(500).send(error));
            
        // res.status(200).send(node);

    } else {
        node = await createNode(req.body)
            .catch(error => {
                res.status(500).send(error);
            });
        
        res.status(201).send(node);
    }
        
});

/**
 * PATCH Update Node
 * 
 * @async
 * @function
 * @param {String} req.params.id Matches the node._id
 * @param {Object} req.body The Node data
 * @returns {Object} res.body - Updated Node
 * @example
 * patch/:_id
 * {
 *  name: name,
 *  type: type,
 *  relations: {
 *  relation._id
 *  }
 * }
 */
router.patch('/:id', auth, async (req, res) => {
    //fetch node
    let node = await findNode(req.params)
        .catch (error => {
            res.status(500).send(error);
        });
    
    //not found
    if (!node) return res.status(404).send();

    //update
    node = await updateNode(node, req.body)
        .catch (error => {
            res.status(500).send(error);
        });

    res.status(200).send(node);
});

/**
 * DELETE Node
 * 
 * @async
 * @function
 * @param {String} req.params.id Matches the node._id
 * @returns {Object} res.body - Deleted Node
 * @example
 * delete/:_id
 */
router.delete('/:id', auth, async (req, res) => {

    //fetch node
    let node = await findNode(req.params)
        .catch (error => {
            res.status(500).send(error);
        });
    
    // not found
    if (!node) return res.status(404).send();

    //delete node
    const result = await deleteNode(node)
        .catch (error => {
            res.status(500).send(error);
        });
   
    res.status(200).send({
        action: 'delete',
        target: result.node,
        relations: result.relationships.nModified
    });
});

/**
 * POST Import Nodes
 * 
 * @async
 * @function
 * @param {String} req.body.type File type [json,csv] (required)
 * @param {Mixin} req.body.data Data: JSON or CSV (required)
 * @returns {Object} res.body - Collection of Nodes
 */
router.post('/import', auth, async (req, res) => {
    // const fileType = req.body.fileType;
    const dataType = req.body.dataType;
    const data = req.body.data;

    let collection;

    if (dataType === 'node') {
        collection = await utilities.importNodes(data);
    } else if (dataType === 'relations') {
        collection = await utilities.importRelation(data);
    }

    res.status(201).send(collection);
});


//* Auxiliar Funciontions */

const findNode = async ({id, name, type}) => {
    let node;

    try {
        if (id) {
            node = await Node.findById(id);
        } else if (name && type) {
            node = await Node.findByNameType(name, type);
        } else if (name) {
            node = await Node.findByName(name);
        }
        
        return node;

    } catch(error) {
        throw new Error(error);
    }
};

const createNode = async (data) => {
    const node = new Node(data);
    await node.save()
        .catch(error => {
            throw new Error(error);
        });

    //add reciprocal relations
    if (data.relations) {
        await Node.updateMany({
            _id: { 
                $in: node.relations
            }},{
                $push: { relations: node._id}
            });
    }
    
    return node;
};

const updateNode = async (node, data) => {

    const updates = Object.keys(data);

     //If relations to remove
     if (data.relationsToRemove) {
        //filter out 
        node.relations = node.relations.filter( rel => {
            if (!data.relationsToRemove.includes(rel.toString())) return rel;
        });

        //delete attribute to avoid conflict
        delete data.relationsToRemove;
    }

    //if relations to add
    if (data.relationsToAdd) {
        //check for duplications
        data.relationsToAdd = data.relationsToAdd.filter( rel => {
            if (!node.relations.includes(rel)) return rel;
        });
    
        //add 
        node.relations = [...node.relations, ...data.relationsToAdd];
        
        //delete attribute to avoid conflict
        delete data.relationsToAdd;
    }

    // //update other attributes 
    updates.forEach((update) => node[update] = data[update]);
    node = await node.save()
        .catch( error => {
            throw new Error(error);
        });

    return node;
};

const deleteNode = async (node) => {
    
    try {
        //remove reference on other nodes
        //use $pull to remove one iten in a array
        const relationships = await Node.updateMany({
            relations: {
                _id: node._id
            }},{
                $pull: { relations: node._id}
            });

        //remove node
        await node.remove();

        return {
            node,
            relationships
        };

    } catch(error) {
        throw new Error(error);
    }
};


module.exports = router;