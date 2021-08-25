// CRUD create read update delete

// const mongodb = require('mongodb') // this library is a mongodb driver allowing us to connect mongoDB database by Node.js. The MongoClient class is a class that allows for making Connections to MongoDB. https://mongodb.github.io/node-mongodb-native/4.0/classes/mongoclient.html
// const MongoClient = mongodb.MongoClient // ".MongoClient" is gonna give us access to the function necessary to connect to the database so we can perfom our basic CRUD operations
// const ObjectID = mongodb.ObjectID

const {MongoClient, ObjectId} = require('mongodb') // Object destructuring, this code sums it all up the past code lines

//Define connection URL in the database we're trying to connect to
const connectionURL = 'mongodb://127.0.0.1:27017' //This is the URL which we can connect to mongodb
const databaseName = 'task-manager'

const id = new ObjectId() //Generate our own id, remember that 'ObjectId' is a constructor, but it's actually a function

// console.log(id)
// console.log(id.getTimestamp()) //Returns the timestamp portion of the object as a Date.
// console.log(id.id)
// console.log(id.id.length)
// console.log(id.toHexString().length)


MongoClient.connect(connectionURL, { useNewUrlParser : true }, (error, client) => { // We use the ".connect" method to connect the specific server "connectionURL". https://mongodb.github.io/node-mongodb-native/4.0/classes/mongoclient.html#connect
    if (error) {
        return console.log('Unable to connect to database')
    }

    const db = client.db(databaseName) // We use the ".db()" method to connect to the specific database "databaseName" that equals to 'task-manager'

    
    //Insert single document
    // db.collection('users').insertOne({ //.insertOne() can be used to insert a single document to database, it will be appear in Robo 3t. If the database 'users' is not created, it will be created automatically
    //     name: 'Vikram',
    //     age: 26
    // }, (error, result) => {
    //     if (error) {
    //         return console.log('Unable to insert user')
    //     }

    //     console.log('inserted: '+ result.insertedId) // https://docs.mongodb.com/drivers/node/current/fundamentals/crud/write-operations/insert/
        
    // })
    

    //Insert multiply documents
    // db.collection('users').insertMany([
    //     {
    //         name: 'Jen',
    //         age: 28
    //     }, {
    //         name:'Gunther',
    //         age: 27
    //     }
    // ], (error, result) => {
    //     if (error) {
    //         return console.log('Unable to insert documents')
    //     }

    //     console.log('inserted: ' + result.insertedIds)
    // })
    

    // db.collection('tasks').insertMany([
    //     {
    //         description: 'Clean the house',
    //         completed: true
    //     },{
    //         description: 'Renew inspection',
    //         completed: false
    //     }, {
    //         description: 'Pot plants',
    //         completed: false
    //     }
    // ], (error, result) => {
    //     if (error) {
    //         return console.log('Unable to insert tasks')
    //     }

    //     console.log('inserted: ' + result.insertedIds)
    // })

    //Finding One Document - Query Object is in this case: "{ _id: new ObjectId("61168d5f3881aeb1aa9b2170") }"
    // db.collection('users').findOne({ _id: new ObjectId("61168d5f3881aeb1aa9b2170") }, (error, user) => {
    //     if (error) {
    //         return console.log('Unable to fetch')
    //     }

    //     console.log(user)
    // })

    //Finding Multiple Documents
    // db.collection('users').find({ age: 27 }).toArray((error, users) => {
    //     console.log(users)
    // })

    // db.collection('tasks').findOne({_id: new ObjectId("61168625d32aab4258ae58bf")}, (error, task) => {
    //     if (error) {
    //         return console.log("Unable to find user")
    //     }

    //     console.log(task)
    // })

    // db.collection('tasks').find({ completed: false }).toArray((error, tasks) => {
    //     if (error) {
    //         return console.log("Unable to find users")
    //     }

    //     console.log(tasks)
    // })

    //Updating documents
    // const updatePromise = db.collection('users').updateOne({
    //     _id: new ObjectId("6119fd9d74c1e815dbcc28db")
    // }, {
    //     $set: {
    //         name: 'Mike'
    //     }
    // })

    // updatePromise.then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    //Shorter code for above
    // db.collection('users').updateOne({
    //     _id: new ObjectId("6119fd9d74c1e815dbcc28db")
    // }, {
    //     // $set: { // Google: mongodb update operators
    //     //     name: 'Mike'
    //     // }
    //     $inc: {
    //         age: 1 //you can use negative values
    //     }
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    // db.collection('tasks').updateMany({
    //     completed: false
    // }, {
    //     $set: {
    //         completed: true
    //     }
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    //Deleting documents:
    // db.collection('users').deleteMany({
    //     age: 27
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

    // db.collection('tasks').deleteMany({
    //     description: "Clean the house"
    // }).then((result) => {
    //     console.log(result)
    // }).catch((error) => {
    //     console.log(error)
    // })

})
    



