const request = require('supertest');
const app = require('../server/app');
const Node = require('../server/models/node');
const {
    connectDatabase,
    setupDatabase,
    closeDatabase,
    userAdmin,
    nodeDepartmentId,
    nodeInterestId,
    nodeResearcherId,
    nodeResearcher
} = require('./fixtures/fixtures');
// const nock = require('nock');
// nock.recorder.rec();

describe('NetVis Nodes API', () => {

    beforeAll(async () => await connectDatabase());
    beforeEach(setupDatabase);
    afterAll(async () => await closeDatabase());

    describe('Get Nodes', () => {
        test('Should get Node by id', async () => {
            expect.assertions(2);

            const response = await request(app).get(`/nodes/${nodeResearcherId}`)
                .send();

            expect(response.status).toBe(200);
            expect(response.body.name).toBe(nodeResearcher.name);
        });

        test('Should get error if node Node dont exist', async () => {
            await request(app).get('/nodes/2')
                .send()
                .expect(500);
        });

        test('Should get Node by type', async () => {
            expect.assertions(2);

            const response = await request(app).get('/nodes/type/Researcher')
                .send();

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('Should get list of Nodes', async () => {
            expect.assertions(2);

            const response = await request(app).get('/nodes/')
                .send();

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('Should search node by name', async () => {
            await request(app).get('/nodes?name=Jo')
                .send()
                .expect(200);
        });

    });

    describe('Add Nodes', () => {
        test('Should add a new node', async () => {
            expect.assertions(3);

            const response = await request(app).post('/nodes')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    name: 'Luciano',
                    type: 'Researcher'
                });

            expect(response.status).toBe(201);

            // Assertions about the response
            expect(response.body).toMatchObject({
                name: 'Luciano',
                type: 'Researcher'
            });

            // Assert that the database was changed correctly
            const user = await Node.findById(response.body._id);
            expect(user).not.toBeNull();
        });

        test('Should add a new node with realtions', async () => {
            expect.assertions(3);

            const response = await request(app).post('/nodes')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    name: 'Luciano',
                    type: 'Researcher',
                    relationToAdd: [
                        nodeDepartmentId,
                        nodeInterestId
                    ]
                });

            expect(response.status).toBe(201);

            // Assertions about the response
            expect(response.body).toMatchObject({
                name: 'Luciano',
                type: 'Researcher'
            });

            // Assert that the database was changed correctly
            const user = await Node.findById(response.body._id);
            expect(user).not.toBeNull();
        });

        test('Should not add duplicated node', async () => {
            await request(app).post('/nodes')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    name: nodeResearcher.name,
                    type: nodeResearcher.type
                }).expect(400);
        });

        test('Should not add without authorization', async () => {
            await request(app).post('/nodes')
                .send({
                    name: nodeResearcher.name,
                    type: nodeResearcher.type
                }).expect(401);
        });
    });

    describe('Update Node', () => {
        test('Should update a node', async () => {
            expect.assertions(2);

            const res = await request(app).patch(`/nodes/${nodeResearcherId}`)
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    name: 'Joe'
                });

            expect(res.status).toBe(200);

            const node = await Node.findById(nodeResearcherId);
            expect(node.name).toEqual('Joe');
        });

        test('Should update a node with add and remove relations', async () => {
            expect.assertions(3);

            //add nodes with rekations
            const res1 = await request(app).post('/nodes')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    name: 'Luciano',
                    type: 'Researcher',
                    relationToAdd: [
                        nodeDepartmentId
                    ]
                });


            expect(res1.status).toBe(201);

            const res2 = await request(app).patch(`/nodes/${res1.body._id}`)
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    name: 'Joe',
                    relationToDelete: [
                        nodeDepartmentId
                    ],
                    relationToAdd: [
                        nodeInterestId
                    ]
                });

            expect(res2.status).toBe(200);

            const node = await Node.findById(res2.body._id);
            expect(node.name).toEqual('Joe');
        });

        test('Should not update without authorization', async () => {
            await request(app).patch(`/nodes/${nodeResearcherId}`)
                .send({
                    name: 'Joe'
                })
                .expect(401);
        });
    });

    describe('Delete Node', () => {
        test('Should delete a node', async () => {
            await request(app).delete(`/nodes/${nodeInterestId}`)
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send()
                .expect(200);
        });

        test('Should not delete without authorization', async () => {
            await request(app).delete(`/nodes/${nodeInterestId}`)
                .send()
                .expect(401);
        });
    });

    describe('Import Nodes', () => {
        test('Import Relations', async () => {
            await request(app).post('/nodes/import')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    fileType: 'csv',
                    dataType: 'relations',
                    data: [{
                            source: 'Person1',
                            sourceType: 'Researcher',
                            target: 'Games',
                            targetType: 'Interest'
                        },
                        {
                            source: 'policy',
                            sourceType: 'Interest',
                            target: 'Person2',
                            targetType: 'Person'
                        },
                        {
                            source: 'Person1',
                            sourceType: 'Researcher',
                            target: 'Coms',
                            targetType: 'Dept'
                        }
                    ]
                }).expect(201);
        });

        test('Import Nodes', async () => {
            await request(app).post('/nodes/import')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    fileType: 'json',
                    dataType: 'node',
                    data: [{
                            name: 'Person1 Last',
                            type: 'Researcher',
                            firstName: 'Person',
                            lastName: 'Last',
                            website: 'www',
                            relations: [{
                                    type: 'Department',
                                    name: 'Communication Studies'
                                },
                                {
                                    type: 'Interest',
                                    name: 'Policy'
                                },
                                {
                                    type: 'Interest',
                                    name: 'Film'
                                }
                            ]
                        },
                        {
                            name: 'Sociology',
                            type: 'Department',
                            website: 'www'
                        },
                        {
                            name: 'Policy',
                            type: 'Interest'
                        }
                    ]
                }).expect(201);
        });
    });

});