//Authentication
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        //const token = req.header('Authorization').replace('Bearer ', '') // ".replace" is an String function that replaces the text you want (first argument), for something you want ("second argument"). In this case we get 'Bearer eyJhbGciOiJIUzI1(token's value)' replaced and we get: eyJhbGciOiJIUzI1
        const token = req.cookies['auth_token']
        const decoded = jwt.verify(token, process.env.JWT_SECRET) // Validating token
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if(!user) {
            throw new Error()
        }

        req.token = token //used in logout
        req.user = user        
        next()
    } catch (e) {
        res.status(401).send({error: 'Please authenticate.'})
    }
}

module.exports = auth

// app.use((req, res, next) => { // "next" argument is specific for middleware
//     if (req.method == 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         next()
//     }
// })
