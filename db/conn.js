const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://abhis201:Zj4UnUrNz3hUg0NL@coursify.xizinwi.mongodb.net/NewsApi",{
    useNewUrlParser : true,
    useUnifiedTopology: true
},()=>{
    console.log("Connected to Mongo Database")
},e=>{
    console.error(e)
});