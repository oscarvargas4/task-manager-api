const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const router = new express.Router()


//Separate Route Files - Exemple
// const router = new express.Router() // Creating a new router
// router.get('/test', (req, res) => { //Setting up our router
//     res.send('This is from my other router')
// })
// app.use(router) //Registering our new router to our app - This will be in the file where is requiring this code. For user.js is requiring from index.js, you can see "app.use(userRouter) // Registering the router"

// app.post('/users', (req, res) => {
//     const user = new User(req.body)

//     user.save().then(() => {
//         res.status(201).send(user)
//     }).catch((e) => {
//         // res.status(400) // https://httpstatuses.com/
//         // res.send(e)
//         res.status(400).send(e)
//     })
// })

//Changing app.post above for async & await (optimized code) 
router.post('/users', async (req, res) => { //!!Change!!: "app.post" is changed for "router.post" so we can export it to "index.js" and because app it doesn't exist in this file
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken() //We generate tokens to keep the user log in once it's created and save it in the database
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

//Login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password) //".findByCredentials" is initialized in "../models/user"
        const token = await user.generateAuthToken()
        res.send({ user, token })
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


//Fetching all information
// app.get('/users', (req, res) => {
//     User.find({}).then((users) => { //https://mongoosejs.com/docs/queries.html // letting .find({}) with an empty object, will fetch all information
//         res.send(users)
//     }).catch((e) => {
//         res.status(500).send() //is not necessary ".send(e)"
//     })
// })

//Changing app.get above for async & await (optimized code)
//router.get('/users/me', auth, async (req, res) => { //auth is the middleware to validate authentication from the user
    // try {
    //     const users = await User.find({})
    //     res.send(users)
    // } catch (e) {
    //     res.status(500).send()
    // }    
// })

router.get('/users/me', auth, async (req, res) => { //auth is the middleware to validate authentication from the user
    res.send(req.user)      
})

//Fetching by id: Capturing dynamic values, these values will be the value after '/users/'
// app.get('/users/:id', (req, res) => {
//     //console.log(req.params) // If we use GET with "localhost:3000/users/123456789", this will print: { id: '123456789' }
//     const _id = req.params.id

//     User.findById(_id).then((user) => { //mongoDB will return nothing where there is not matches, this is why we must do some condicionals
//         if(!user) { // If there is not a user
//             return res.status(404).send()
//         }

//         res.send(user)
//     }).catch((e) => {
//         res.status(500).send()
//     })
// })

//Changing app.get above for async & await (optimized code)
//This code is depracated because of router.get('/users/me'..) makes his job, but now, we only can se our own user, not others, searching by id
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)
//         if (!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// //Resource Updating Endpoints
// router.patch('/users/:id', async (req, res) => {
//     const updates = Object.keys(req.body) //Object.keys converts an object to an Array
//     const allowedUpdates = ['name', 'email', 'password', 'age'] //properties that the users can update
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update)) // for every item of "updates", the function will check in every update (each item of the array upgrades) if it is included in the array allowedUpdates, it will return true if every item of updates is included in the array allowedUpdates
    
//     if (!isValidOperation) {
//         return res.status(400).send({error: 'Invalid updates'})
//     }

//     try {
//         const user = await User.findById(req.params.id)

//         updates.forEach((update) => user[update] = req.body[update]) //Overwriting user array with each req.body value
//         await user.save()

//         // This is comment because it does not work with Middleware, is replaced with the lines up above// const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })// Option "new: true" This is going to return the new user as opposed to the existing one that was found before the update. So right here, we'll have back the latest data, the original user with the updates applied.
//         //Option: "runValidators: true" This is going to make sure that we do run validation for the update. So if I tried to update my name to something existent, I want to make sure that fails.

//         if(!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {
//         res.status(400).send()
        
//     }
// })

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

//Resource Deleting Endpoints - Anyone can delete an account providing the id
// router.delete('/users/:id', async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id)

//         if(!user) {
//             res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {
//         res.status(500).send(e)
//     }
// })

//Resource Deleting Endpoints - The user can delete his account
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)

        // if(!user) {
        //     res.status(404).send()
        // }
        // res.send(user)

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
    //"req.file" is an Object which contains all file properties. Buffer contains a buffer of all of the binary data for that file and this is exactly what we want access to.
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

