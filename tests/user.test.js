const request = require('supertest');
const app = require('../server/app');
const User = require('../server/models/user');
const {
    setupDatabase,
    userAdminID,
    userAdmin
} = require('./fixtures/fixtures');
// const mockSendgrid = require('./mocks/sendgrid');
// const nock = require('nock');
// nock.recorder.rec();


describe('NetVis Users API', () => {

    beforeEach(setupDatabase);

    describe('User Login', () => {
        test('Should login user', async () => {
            expect.assertions(2);

            const response = await request(app).post('/users/login')
                .send({
                    email: userAdmin.email,
                    password: userAdmin.password
                });

            expect(response.status).toBe(200);

            const user = await User.findById(userAdminID);
            expect(response.body.token).toBe(user.tokens[1].token);
        });

        test('Should not login nonexistent user', async () => {
            await request(app).post('/users/login')
                .send({
                    email: userAdmin.email,
                    password: 'thisisnotmypass'
                }).expect(400);
        });
    });

    describe('Get Users', () => {
        test('Should get list of users', async () => {
            expect.assertions(2);

            const response = await request(app).get('/users/')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send();

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test('Should get my profile', async () => {
            await request(app).get('/users/me')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send()
                .expect(200);
        });

        test('Should get profile for user', async () => {
            await request(app).get(`/users/${userAdminID}`)
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send()
                .expect(200);
        });

        test('Should not get profile for unexistent user', async () => {
            await request(app).get('/users/2')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send()
                .expect(500);
        });

        test('Should not get profile for unauthenticated user', async () => {
            await request(app).get(`/users/${userAdminID}`).send()
                .expect(401);
        });
    });

    describe('Add User', () => {
        test.skip('Should signup a new user', async () => {
            expect.assertions(4);

            //moks: Se4ngrid has and issue with Nock in the header transformation.
            // mockSendgrid.sendEmailInvite();

            const response = await request(app).post('/users')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    firstName: 'Luciano',
                    email: 'lucaju@me.com',
                    password: 'MyPass777!',
                    level: 0
                });

            expect(response.status).toBe(201);

            // Assertions about the response
            expect(response.body).toMatchObject({
                firstName: 'Luciano',
                email: 'lucaju@me.com',
                level: 0
            });

            // Assert that the database was changed correctly
            const user = await User.findById(response.body._id);
            expect(user).not.toBeNull();
            expect(user.password).not.toBe('MyPass777!');
        });
    });

    describe('Update User', () => {
        test('Should update valid user fields', async () => {
            expect.assertions(2);

            const res = await request(app).patch(`/users/${userAdminID}`)
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    firstName: 'John'
                });

            expect(res.status).toBe(200);

            const user = await User.findById(userAdminID);
            expect(user.firstName).toEqual('John');
        });

        test('Should update my user fields', async () => {
            expect.assertions(2);

            const res = await request(app).patch('/users/me')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    firstName: 'John'
                });

            expect(res.status).toBe(200);

            const user = await User.findById(userAdminID);
            expect(user.firstName).toEqual('John');
        });

        test('Should not update invalid user fields', async () => {
            await request(app).patch('/users/me')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    email: 'newemail@email.com'
                })
                .expect(400);
        });

        test('Should not update unexistent user', async () => {
            await request(app).patch('/users/2')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send({
                    firstName: 'John'
                })
                .expect(400);
        });
    });

    describe('Delete User', () => {
        test('Should delete account for user', async () => {
            expect.assertions(2);

            const res = await request(app).delete(`/users/${userAdminID}`)
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send();

            expect(res.status).toBe(200);

            const user = await User.findById(userAdminID);
            expect(user).toBeNull();
        });

        test('Should delete my account', async () => {
            expect.assertions(2);

            const res = await request(app).delete('/users/me')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send();

            expect(res.status).toBe(200);

            const user = await User.findById(userAdminID);
            expect(user).toBeNull();
        });

        test('Should not delete unexistent account', async () => {
            await request(app).delete('/users/2')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send()
                .expect(500);
        });

        test('Should not delete account for unauthenticate user', async () => {
            await request(app).delete(`/users/${userAdminID}`)
                .send()
                .expect(401);
        });
    });

    describe('User Logout', () => {
        test('Should logout user', async () => {
            await request(app).post('/users/logout')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send()
                .expect(200);
        });

        test('Should logout user from all devices', async () => {
            await request(app).post('/users/logoutAll')
                .set('Authorization', `Bearer ${userAdmin.tokens[0].token}`)
                .send()
                .expect(200);
        });
    });

    describe('Reset Password', () => {
        test.skip('Should generate a password reset request', async () => {
            await request(app).post('/users/forgotPassword')
                .send({
                    email: 'admin@email.com'
                })
                .expect(200);
        });

        test('Should not generate a password reset for unexistent user', async () => {
            await request(app).post('/users/forgotPassword')
                .send({
                    email: 'admin__@email.com'
                })
                .expect(404);
        });

        test.todo('Should acceept password request for a user');
        test.todo('Should reject password request for a user');

        test('Should reset password for a user', async () => {
            await request(app).post('/reset/reset')
                .send({
                    _id: userAdminID,
                    password: 'MyPass777!',
                })
                .expect(200);
        });
        
    });

});