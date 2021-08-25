const mongoose = require('mongoose')

//Conecting to our database
mongoose.connect(process.env.MONGODB_URL, { // url connection to mongodb database
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true //This is going to make sure that when mongoose works with MongoDB, Database indexes are created, allowing us to quickly access the data we need to access.
})

