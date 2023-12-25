const mongoose = require('mongoose')
const dbName = process.env.DB_NAME
mongoose.connect("mongodb://127.0.0.1:27017/"+dbName)
.then(() => {
    console.log("connected to the database")
})
.catch((err) => {
    console.log(err + "\n\n\n error occured while connecteing to database")
})