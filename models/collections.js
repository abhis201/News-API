require("dotenv").config()
const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")
const path = require("path")
const jwt = require("jsonwebtoken")

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
    email: {type:String ,required:true,validate: [ validator.isEmail, 'invalid email' ]},
    password: {type: String, required: true},
    tokens:[{
        token:{
            type:String,
            required: true
        }
    }]
})

user.methods.generateAuthToken = async function(){
    try {
        const authtoken = await jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({token:authtoken})
        return authtoken;
    }catch (error){
        console.log(error);
    }
}

user.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
    next()
})


const articles = mongoose.model("article",article);
const users = mongoose.model("user",user);
const sources = mongoose.model("source",source);

const news = {'article':articles, 'user':users, 'source':sources}

module.exports = news;