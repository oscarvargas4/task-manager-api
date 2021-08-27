const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

app.use(express.json()) //"use()" customizes our server. The whole line will parse our incoming JSON to an object so we can access it in our request handlers
app.use(userRouter) // Registering the router 
app.use(taskRouter)

module.exports = app