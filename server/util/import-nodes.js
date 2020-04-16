const Node = require('../models/node');

const importNodes = async data => {
    const collection = [];

    for (const nodeData of data) {

        //check if data node has name and type
        if (!nodeData.name || !nodeData.type) continue;

        //check if node exists
        let node = await Node.findByNameType(nodeData.name, nodeData.type)
            .catch(error => {
                throw new Error(error);
            });

        if (!node) node = new Node(nodeData);

        //relations
        if (nodeData.relations) {
            nodeData.relations = await addRelations(node, nodeData.relations);
            node.relations = [...node.relations, ...nodeData.relations];
        }

        //save
        await node.save();

        collection.push(node);
    }

    return collection;
};

const addRelations = async (nodeSource, data) => {

    const relCollection = [];

    for (const nodeData of data) {

        //check if data node has name and type
        if (!nodeData.name || !nodeData.type) continue;

        //if exist, return id
        //if doesn't exist, create and return id
        let node = await Node.findByNameType(nodeData.name, nodeData.type);

        if (node) {

            if (node.relations) {
                node.relations = [...node.relations, nodeSource._id.toString()];
            } else {
                node.relations = [nodeSource._id.toString()];
            }

        } else {

            node = new Node({
                name: nodeData.name,
                type: nodeData.type,
                relations: [nodeSource._id.toString()]
            });

        }

        await node.save();

        relCollection.push(node._id.toString());
    }

    return relCollection;

};

const importRelation = async data => {
    const collection = [];

    for (const pair of data) {

        //check if data nodes has name and type
        if (!pair.source || !pair.sourceType || !pair.target || !pair.targetType) continue;

        //-----------check source
        let nodeSource = await Node.findByNameType(pair.source, pair.sourceType)
            .catch(error => {
                throw new Error(error);
            });

        if (!nodeSource) {
            nodeSource = new Node({
                name: pair.source,
                type: pair.sourceType
            });
        }

        //-------check target
        let nodeTarget = await Node.findByNameType(pair.target, pair.targetType)
            .catch(error => {
                throw new Error(error);
            });

        if (!nodeTarget) {
            nodeTarget = new Node({
                name: pair.target,
                type: pair.targetType
            });
        }

        //------ csurce relations
        if (nodeSource.relations) {
            nodeSource.relations = [...nodeSource.relations, nodeTarget._id.toString()];
        } else {
            nodeSource.relations = [nodeTarget._id.toString()];
        }

        // ------ target relations
        if (nodeTarget.relations) {
            nodeTarget.relations = [...nodeTarget.relations, nodeSource._id.toString()];
        } else {
            nodeTarget.relations = [nodeSource._id.toString()];
        }

        //--- save both
        await nodeSource.save();
        await nodeTarget.save();

        //collect both
        collection.push(nodeSource);
        collection.push(nodeTarget);
    }

    return collection;
};


module.exports = {
    importNodes,
    importRelation
};