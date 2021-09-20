const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const path = require('path')
const cookieParser = require('cookie-parser')

const app = express()

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
app.use(express.json()) //"use()" customizes our server. The whole line will parse our incoming JSON to an object so we can access it in our request handlers
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(userRouter) // Registering the router 
app.use(taskRouter)

module.exports = app