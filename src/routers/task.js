const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()


// app.post('/tasks', (req, res) => {
//     const task = new Task(req.body)

//     task.save().then(() => {
//         res.status(201).send(task)
//     }).catch((e) => {
//         res.status(400).send(e) // https://httpstatuses.com/
//     })
// })

//Changing app.post above for async & await (optimized code)
router.post('/tasks', auth, async (req, res) => { //!!Change!!: "app.post" is changed for "router.post" so we can export it to "index.js" and because app it doesn't exist in this file
    const task = new Task({
        ...req.body, //"..." ES6 spread operator. "...req.body" will going to copy all the properties from the body over to this object
        owner: req.user._id

    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Fetching all information
// app.get('/tasks', (req, res) => {
//     Task.find({}).then((tasks) => {
//         res.send(tasks)
//     }).catch((e) => {
//         res.status(500).send()
//     })
// })

//GET /tasks?completed=true
//GET /tasks?limit=10&skip=20
//GET /task?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        // const tasks = await Task.find({ owner: req.user._id  }) 
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }            
        }).execPopulate() //Alternative code for code above
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }    
})

//Fetching by id
// app.get('/tasks/:id', (req, res) => {
//     const _id = req.params.id

//     Task.findById(_id).then((task) => {
//         if (!task) {
//             return res.status(404).send()
//         }

//         res.send(task)
//     }).catch((e) => {
//         res.status(500).send()
//     })
// })

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if(!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

//Resource Updating Endpoints
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
                
        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
                
        // This is commented because it does not work with Middleware, is replaced with the lines up above// 
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }) // Option "new: true" This is going to return the new user as opposed to the existing one that was found before the update. So right here, we'll have back the latest data, the original user with the updates applied.
        //Option: "runValidators: true" This is going to make sure that we do run validation for the update. So if I tried to update my name to something existent, I want to make sure that fails.
        
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
    
})

//Resource Deleting Endpoints
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)

    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router