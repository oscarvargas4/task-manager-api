const app = require('./app')

//Al commented code below until "const port" is moved to app.js 

// const express = require('express')
// require('./db/mongoose')
// const User = require('./models/user')
// const Task = require('./models/task')
// const userRouter = require('./routers/user')
// const taskRouter = require('./routers/task')

// const app = express()
const port = process.env.PORT // "|| 3000" is now defined in config folder


//Maintance web - When you want shut down all requests
// app.use((req, res, next) => {    
//     res.status(503).send('Site is currently down. Check back soon')
// })



app.use(express.json()) //"use()" customizes our server. The whole line will parse our incoming JSON to an object so we can access it in our request handlers
app.use(userRouter) // Registering the router 
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

//Hashing Passwords with Bcrypt
// const bcrypt = require('bcryptjs')

// const myFunction = async () => {
//     const password = 'Red12345!'
//     const hashedPassword = await bcrypt.hash(password, 8) // 8 is the number of rounds determines how many times the hashing algoritm is executed

//     console.log(password)
//     console.log(hashedPassword)

//     //The goal is to figure it out if a given password matches the hashedPassword that will say is stored in the database
//     const isMatch = await bcrypt.compare('Red12345!', hashedPassword) // Returns true when first argument is hashed and matches with the second argument. ".compare" is case sensitive
//     console.log(isMatch)
// }

// myFunction()

//JSON Web Tokens - Creating authentication tokens and how to validate them
// const jwt = require('jsonwebtoken')

// const myFunction = async () => {
//     const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse', { expiresIn: '7 days' }) //The sign method can be used to generate a new token. sign accepts three arguments: The first is the data to embed in the token: This needs to include a unique identifier for the user. The second is a secret phrase: This is used to issue and validate tokens, ensuring that the token data hasn’t been tampered with. The third is a set of options: The example below uses expiresIn to create a token that’s valid for seven days.
//     console.log(token)

//     const data = jwt.verify(token, 'thisismynewcourse') // The server can verify the token using ".verify". This requires two arguments: The first is the token to validate. The second is the secret phrase that the token was created with. If valid, the embedded data will be returned. This would allow the server to figure out which user is performing the operation.
//     console.log(data) // If the secret phrase does not match with the given when the token was created, it will return Error
// }

// myFunction()


//Exemples of ".populate().execPopulate()" function
// const main = async () => {
//     // const task = await Task.findById('612339fc1514bc35982ad509')
//     // await task.populate('owner').execPopulate() // This line will bring to us the profile owner associated to this task
//     // console.log(task.owner)

//     const user = await User.findById('61233842d68aa504385366e3')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks)
// }

// main()

