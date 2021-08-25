const mongoose = require('mongoose')

// const Task = mongoose.model('Task', {
//     description: {
//         type: String,
//         trim: true,
//         required: true
//     },
//     completed: {
//         type: Boolean,
//         default: false
//     },
//     owner: {
//         type: mongoose.Schema.Types.ObjectId,
//         required: true,
//         ref: 'User' //referencing the task with his owner
//     }
// })

//Passing model to schema to enable timestamps
const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' //referencing the task with his owner
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task

// const task = new Task({
//     description: '                    Learn the Mongoose library                  ',
//     completed: true
// })

// task.save().then(() => {
//     console.log(task)
// }).catch((error) => {
//     console.log('Error', error)
// })