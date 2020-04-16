const request = require('supertest');
const app = require('../server/app');
const {
    setupDatabase,
    meta,
    userAdmin
} = require('./fixtures/fixtures');
// const nock = require('nock');
// nock.recorder.rec();


describe('NetVis Meta API', () => {

    beforeEach(setupDatabase);

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

});