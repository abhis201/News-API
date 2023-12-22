const jwt = require("jsonwebtoken");
const collection = require("../models/collections.js")
const cP = require("cookie-parser")
const express = require("express")
const app = express();

app.use(cP())

const auth = async(req,res,next)=>{
    try {
        const token = req.cookies.jwt.toString();
        const val = await jwt.verify(token,process.env.SECRET_KEY);
        console.log(val);
        if(val){
            next()
        }
        else{
            console.log("Authentication Failed!");
        }
    }catch (error) {
        res.status(401).send(error)
    }
}

module.exports = auth;