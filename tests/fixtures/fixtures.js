const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Meta = require('../../server/models/meta');
const User = require('../../server/models/user');
const Node = require('../../server/models/node');


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

module.exports = {
    setupDatabase,
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