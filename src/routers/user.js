const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const path= require('path')
const router = new express.Router()


//Changing app.post above for async & await (optimized code) 
router.post('/users', async (req, res) => { //!!Change!!: "app.post" is changed for "router.post" so we can export it to "index.js" and because app it doesn't exist in this file
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken() //We generate tokens to keep the user log in once it's created and save it in the database
        res.cookie('auth_token', token)
        res.sendFile(path.resolve(__dirname, '..', 'views', 'private.html'))
        //res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

//Login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password) //".findByCredentials" is initialized in "../models/user"
        const token = await user.generateAuthToken()
        res.cookie('auth_token', token)
        res.sendFile(path.resolve(__dirname, '..', 'views', 'private.html'))
        //res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

//Logging out for 1 devices
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => { // token is initialized in const auth which is in "../middleware/auth"
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//Logging out for all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [] // wiping out the array
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => { //auth is the middleware to validate authentication from the user
    res.send(req.user)      
})

//Resource Updating Endpoints by User - Look the code above to see explanations
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send()
    }
})

//Resource Deleting Endpoints - The user can delete his account
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove() // Mongoose async method that summarizes the code above (commented)
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

//Endpoint for avatar upload file - Multer
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {  // "\.(doc|docx)$" regular expression -> regex101.com. If it doesn't match will bring false, so will be Error
            return cb(new Error('Please upload an image with these formats: jpg, jpeg or png'))
        }

        cb (undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => { //Handling Express Errors - "auth, upload.single('avatar')" are middlewares
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer() //auto-cropping and image formatting - https://www.npmjs.com/package/sharp
    req.user.avatar = buffer     
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//Deleting user's avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()    
})

//Fetching user's image
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type','image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})


module.exports = router

