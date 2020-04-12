const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const mongoDB = require('../../server/db/mongoDB');
const Meta = require('../../server/models/meta');
const User = require('../../server/models/user');
const Node = require('../../server/models/node');

let mongo;

const meta = {
    title: 'NetVis',
    url: 'localhost',
    email: 'lucaju@gmail.com'
};

const userAdminID = new mongoose.Types.ObjectId();
const userAdmin = {
    _id: userAdminID,
    firstName: 'admin',
    email: 'lucaju@gmail.com',
    password: '56what!!',
    level: 0,
    tokens: [{
        token: jwt.sign({ _id: userAdminID }, process.env.JWT_SECRET)
    }]
};

const nodeDepartmentId = new mongoose.Types.ObjectId();
const nodeDepartment = {
    _id: nodeDepartmentId,
    name: 'Sociology',
    type: 'Department'
};

const nodeInterestId = new mongoose.Types.ObjectId();
const nodeInterest = {
    _id: nodeInterestId,
    name: 'Society',
    type: 'Interest'
};

const nodeResearcherId = new mongoose.Types.ObjectId();
const nodeResearcher = {
    _id: nodeResearcherId,
    name: 'John',
    type: 'Researcher'
};

const connectDatabase = async () => {
    mongo = await mongoDB.connect().catch(() => {
        throw new Error('NetVis need to be install!');
    });
};

const setupDatabase = async () => {
    await Meta.deleteMany();
    await User.deleteMany();
    await Node.deleteMany();

    await new Meta(meta).save();
    await new User(userAdmin).save();
    await new Node(nodeDepartment).save();
    await new Node(nodeInterest).save();
    await new Node(nodeResearcher).save();
};

const closeDatabase = async () => {
    await mongo.close();
};

module.exports = {
    connectDatabase,
    setupDatabase,
    closeDatabase,
    meta,
    userAdminID,
    userAdmin,
    nodeDepartmentId,
    nodeDepartment,
    nodeInterestId,
    nodeInterest,
    nodeResearcherId,
    nodeResearcher
};