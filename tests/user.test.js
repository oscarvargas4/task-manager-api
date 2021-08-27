const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

//Test cases
test('Should signup a new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Oscar',
        email: 'oscar@example.com',
        password: 'MyPass777!'
    }).expect(201)

    // Assert that the databases was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Oscar',
            email: 'oscar@example.com'
        },
        token: user.tokens[0].token
    })
    
    // Assertions about the password is Hashed
    expect(user.password).not.toBe('MyPass777!')
})

test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    // Assert that token in response matches user's second token
    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login existing user', async () => {
    await request(app).post('/user/login').send({
        email: 'nonexisting@example.com',
        password: 'hello4!'
    }).expect(404)
})

test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`) //confirming token to login for that user
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401) // unauthenticated
    
})

test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    // Assert null response 
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer)) // ".toBe" uses "===" and, {} === {} are not identical, they uses differents spaces of memory. This is why we use ".toEqual". We're looking for Avatar property and we're checking if it equals any buffer, if it does great,if it does not, that's a problem because the image hasn't been uploaded correctly.
})

test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Oscar Vargas'
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toBe('Oscar Vargas')
})

test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Barcelona'
        })
        .expect(400)
})

