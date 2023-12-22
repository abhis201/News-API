require("dotenv").config()
const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

var schema = mongoose.Schema;

const reviews = schema({
    userid: { type: String, required: true, unique: true, sparse: true },
    email: { type: String, required: true, validate: [validator.isEmail, 'invalid email'] },
    message: { type: String, required: true }
})

const article = schema({
    source: {
        id: { type: String },
        name: { type: String }
    },
    user: { type: schema.Types.ObjectId, ref: 'user' },
    title: { type: String, unique: true, sparse: true },
    description: { type: String, index: true },
    url: { type: String },
    urlToImage: { type: String },
    publishedAt: { type: Date, default: Date.now },
    content: { type: String }
})
//unique insertion
article.index({ 'description': 1 }, { unique: true, sparse: true })

const user = schema({

    userid: { type: String, required: true, unique: true, sparse: true },
    email: { type: String, required: true, validate: [validator.isEmail, 'invalid email'] },
    password: { type: String, required: true },
    token: { type: String }
})

user.methods.generateAuthToken = async function () {
    try {
        const authtoken = await jwt.sign({ _id: this._id.toString(), userid: this.userid.toString() }, process.env.SECRET_KEY)
        this.token = authtoken
        return authtoken;
    } catch (error) {
        console.log(error);
    }
}

user.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next()
})


const articles = mongoose.model("article", article);
const users = mongoose.model("user", user);
const review = mongoose.model("reviews", reviews);

const news = { 'article': articles, 'user': users, 'review': review }

module.exports = news;