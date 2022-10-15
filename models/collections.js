const mongoose = require("mongoose")
const validator = require("validator")

var schema = mongoose.Schema;

const source = schema({
    id: {type: String, required: true},
    name: {type: String}
})

const article = schema({

    source: source,
    user: {type:schema.Types.ObjectId, ref:'user'},
    title: {type: String, unique:true, sparse:true},
    description: {type: String, index:true},
    url: {type: String},
    urlToImage: {type:String},
    publishedAt: {type:Date, default:Date.now},
    content:{type:String}
})
//unique insertion
article.index({'description':1},{unique:true,sparse:true})

const user = schema({

    userid: {type: String, required: true, unique:true, sparse:true},
    email: {type:String ,required:true,validate(value){
        if(!validator.isEmail(value)){
            throw new Error("Invalid email id")
        }
    }},
    password: {type: String, required: true}
})


const articles = mongoose.model("article",article);
const users = mongoose.model("user",user);
const sources = mongoose.model("source",source);

const news = {'article':articles, 'user':users, 'source':sources}

module.exports = news;