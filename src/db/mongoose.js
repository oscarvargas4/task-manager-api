const mongoose = require('mongoose')

//Conecting to our database
mongoose.connect(process.env.MONGODB_URL, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true 
})

