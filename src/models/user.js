const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

//With userSchema, we are creating a separate schema and a separate model and this is going to allow us to take advantage of middleware (https://mongoosejs.com/docs/middleware.html)
const userSchema = new mongoose.Schema({ //mongoose take your database's name, in this case 'User' and converts to lowercase ('user'), and then pluralizes it ('users'), and this, will be the name for your collection.
    name: {
        type: String,
        required: true, // SchemaTypes: https://mongoosejs.com/docs/schematypes.html
        trim: true  
    }, 
    email: {
        type: String,
        unique: true, // emails will be unique, it cannot be another in the same database
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid ')
            }
        }
    },
    password: {
        type: String,
        require: true,
        trim: true,
        minLength: 7, //creates a validator that checks if the value length is not less than the given number
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('Age must be a positive number') // This will throw an Error that will say the String provided as an argument
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer //This is going to allow us to store the buffer with our binary image data right in the database alongside
    }
},{
    timestamps: true
})

//Virtual Property
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//Hiding Private Data (password and tokens) - This function is never called, but it calls itself by ".toJSON". toJSON is 
//a special property in JavaScript that is called when JSON.stringify is called on an object. When a Mongoose document 
//is passed to res.send, Mongoose converts the object into JSON. You can customize this by adding toJSON as a method on 
//the object. The method below removes the password and tokens properties before sending the response back https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#tojson_behavior
userSchema.methods.toJSON = function () {//*IMPORTANT* note that this is not asynchronous function
    const user = this
    const userObject = user.toObject() 

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//Login
userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)// Allows to get the user id of the muser created by the Schema

    user.tokens = user.tokens.concat({ token }) // { token: token }
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => { //Schema Statics are methods that can be invoked directly by a Model (unlike Schema Methods, which need to be invoked by an instance of a Mongoose document). What statics do? This is the Mongoose way to set up class methods you can access like User.doSomething or Car.doSomething. These are methods called on the class itself as opposed to an instance of the class. We add our methods there and Mongoose sets them up behind the scenes as class methods. https://www.w3schools.com/js/js_class_static.asp
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    } 

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//Middleware - Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) { // This will be true when the user is created or when is upgraded and password was upgraded too
        user.password = await bcrypt.hash(user.password, 8) // Hashing password
    }

    next()
})

//Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

//Creating the user model 
const User = mongoose.model('User', userSchema)

module.exports = User

//Example code to create a new User:

// const me = new User({
//     name: '      Mike     ',
//     email: 'MIKE@hotmail.com    ',
//     password: 'HelloWorld122',
//     age: 27
// })

// me.save().then(() => {
//     console.log(me) // __v stands for version
// }).catch((error) => {
//     console.log('Error', error)
// })