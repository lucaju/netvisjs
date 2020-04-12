const request = require('supertest');
const app = require('../server/app');
const {
    connectDatabase,
    setupDatabase,
    closeDatabase,
    meta,
    userAdmin
} = require('./fixtures/fixtures');
// const nock = require('nock');
// nock.recorder.rec();


describe('NetVis Meta API', () => {

    beforeAll(async () => await connectDatabase());
    beforeEach(setupDatabase);
    afterAll(async () => await closeDatabase());

    describe('Get Meta Property', () => {
        test('Should get meta', async () => {
            expect.assertions(3);

            const res = await request(app).get('/meta');

            expect(res.status).toBe(200);
            expect(res.body).not.toBeNull();
            expect(res.body.title).toBe(meta.title);
        });

        test('Should get meta property', async () => {
            expect.assertions(3);

            const res = await request(app).get('/meta/title');

            expect(res.status).toBe(200);
            expect(res.body).not.toBeNull();
            expect(res.body.title).toBe(meta.title);
        });

        test('Should not get meta unxistent property', async () => {
            await request(app).get('/meta/author')
                .expect(400);
        });
    });

    describe('Create Meta Property', () => {
        test('Should add new meta property', async () => {
            expect.assertions(3);

            const res = await request(app).post('/meta')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    autor: 'Luciano'
                });

            expect(res.status).toBe(200);
            expect(res.body).not.toBeNull();
            expect(res.body.autor).toBe('Luciano');
        });
    });

    describe('Update Meta Property', () => {
        test('Should update meta property', async () => {
            expect.assertions(3);

            const res = await request(app).patch('/meta')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    title: 'Visualizatiom'
                });

            expect(res.status).toBe(200);
            expect(res.body).not.toBeNull();
            expect(res.body.title).toBe('Visualizatiom');
        });

        test('Should not update meta property', async () => {
            expect.assertions(1);

            const res = await request(app).patch('/meta')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    _id: []
                });

            expect(res.status).toBe(400);
        });
    });

    describe('Delete Meta Property', () => {
        test('Should delete meta property', async () => {
            expect.assertions(1);

            await request(app).post('/meta')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    autor: 'Luciano'
                });

            const res2 = await request(app).delete('/meta/autor')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send();

            expect(res2.status).toBe(200);
        });

        test('Should not delete meta property', async () => {
            await request(app).delete('/meta/title')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send()
                .expect(400);
        });

        test('Should not delete meta property for unauthenticate user', async () => {
            await request(app).delete('/meta/title')
                .send()
                .expect(401);
        });
    });

    describe('Connect', () => {

        test('Should connent to MongoDB', async () => {
            await request(app).post('/meta/connect')
                .send()
                .expect(200);
        });

    });

    describe('Install', () => {

        test('Should not install Netvis: already installed', async () => {
            await request(app).post('/meta/install')
                .send()
                .expect(400);
        });

        test('Should not install Netvis: invalid data', async () => {

            process.env.MONGODB_HOST = '';
            process.env.MONGODB_PORT = '';
            process.env.MONGODB_DATABASE = '';
            process.env.SENDGRID_API_KEY = '';
            process.env.JWT_SECRET = '';

            await request(app).post('/meta/install')
                .send({
                    mongoDB: {},
                    user: {},
                    meta: {}
                })
                .expect(400);
        });

        test.skip('Should install Netvis', async () => {

            //moks: Se4ngrid has and issue with Nock in the header transformation.
            // mockSendgrid.sendEmailInvite();

            process.env.MONGODB_HOST = '';
            process.env.MONGODB_PORT = '';
            process.env.MONGODB_DATABASE = '';
            process.env.SENDGRID_API_KEY = '';
            process.env.JWT_SECRET = '';

            await request(app).post('/meta/install')
                .send({
                    mongoDB: {
                        host: '127.0.0.1',
                        port: '27017',
                        database: 'netvisjs-test'
                    },
                    user: {
                        email: 'lucaju@gmail.com',
                        password: '6what!!'
                    },
                    meta: {
                        title: 'Netvis',
                        url: 'http://localhost',
                        sendgridAPI: 'SG.12345'
                    }
                })
                .expect(201);
        });

    });

});