const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost:27017/NewsApi",{
    useNewUrlParser : true,
    useUnifiedTopology: true
},()=>{
    console.log("Connected to Mongo Database")
},e=>{
    console.error(e)
});