const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const hbs = require('hbs');
require(path.join(__dirname,"db/conn"));
const news = require(path.join(__dirname,"/models/collections"));
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const auth = require(path.join(__dirname,'/middleware/auth'))
const methodOverride = require('method-override')

app.use(cookieParser())

app.use(methodOverride('_method'))

const port = process.env.PORT || 3000;

const static = path.join(__dirname,"static");

const bootcss = path.join(__dirname,"/node_modules/bootstrap/dist/css");
const bootjs = path.join(__dirname,"/node_modules/bootstrap/dist/js");
const jq = path.join(__dirname,"/node_modules/jquery/dist");


app.use("/css",express.static(bootcss));
app.use("/js",express.static(bootjs));
app.use("/jq",express.static(jq));

app.use(express.static(static));

const partials = path.join(__dirname,"/views/partials");
app.set('view engine','hbs');
hbs.registerPartials(partials);

app.use(express.urlencoded({extended:false}))

// app.use(express.json())

// app.use(methodOverride("_method"))

app.get("",async(req,res)=>{

    let user = news.user
    let article = news.article
    let source = news.source

    let data = await user.find().distinct('userid')

    // console.log(data)

    let u = await user.find()
    let a = await article.find()
    let s = await source.find()

    const cu = u.length;
    const ca = a.length;
    const cs = s.length;

    let count = {'srcnum':cs,'artnum':ca,'usnum':cu}

    let card = null;

    console.log(`Cookie value: ${req.cookies.jwt}`);

    if(req.query.search){
        const regex = new RegExp(".*"+req.query.search+".*",'i')

        card = await news.article.find({$or:[{title:{$regex:regex}},{description:{$regex:regex}},{content:{$regex:regex}}]})
    }
    else if(!req.query.search)
    {
        card = await article.find()
        if(!data){
            console.log("No Users found");
        }
    }
    let pass = {'user':data[0],'users':data,'articles':card,'sources':source,'count':count}

    res.render("home",pass);
})

app.get("/createnews",auth,(req,res)=>{

    res.render("createnews",{'insert':true})
})

app.post("/signup",async(req,res)=>{
    try{
        const userid = req.body.userid;
        const email = req.body.email;
        const pass = req.body.pass;
        const userdata = await news.user.findOne({userid:userid,email:email})

        const matchpass = await bcrypt.compare(pass,userdata.password)
        if(matchpass){
            res.cookie('jwt',userdata.tokens)
            res.render("home")
        }
        else{
            res.status(401).send("Wrong Password");
        }
    }
    catch(error){
        console.log(error)
        res.status(401).send("Invalid Login Detail")
    }
})

app.post("",async(req,res) =>{
    
    let uid = req.body.userID;
    let eid = req.body.emailID;
    let pass = req.body.pass;

    let checkdup = news.user.findOne({userid:uid},async(err,result)=>{
        if(err) res.send(err.message)
        if(result) res.send("User Data already present")
        else{
            let adduser = new news.user({userid:uid,email:eid,password:pass})

            const token = await adduser.generateAuthToken();
            console.log(token)
            const data = await adduser.save()
            res.cookie("jwt",token,{
                expires: new Date(Date.now() + 30000),
                httpOnly: true
            })
            console.log("User Added: "+data);
            res.status(201).render("dataentered")
        }
    })
    
})

app.post("/:id",async(req,res)=>{
    if(req.params.id=='article'){
        const arcs = await news.article.find().distinct('title')
        console.log(arcs)

        for(let arc of arcs){
            try{
                const rec = await news.article.findOne({title:arc})
                const del = await news.article.deleteMany({title:arc})
                console.log(del)
                const addone = new news.article({'title':rec.title,'description':rec.description,'url':rec.url,'urlToImage':rec.urlToImage,'publishedAt':rec.publishedAt,'content':rec.content})
                await addone.save()
            }
            catch(e){
                console.log(e.message)
            }
        }
        res.render("home")
    }
    else if(req.params.id=='source'){
        const srcs = await news.source.find().distinct('id')
        console.log(srcs)

        for(let src of srcs){
            try{
                const rec = await news.source.findOne({id:src})
                const del = await news.source.deleteMany({id:src})
                console.log(del)
                const addone = new news.source({'id':rec.id,'name':rec.name})
                await addone.save()
            }
            catch(e){
                console.log(e.message)
            }
        }
        res.render("home")
    }
    else if(req.params.id=='user'){
        const users = await news.user.find().distinct('userid')

        for(let user of users){
            try{
                const rec = await news.user.findOne({userid:user})
                const del = await news.user.deleteMany({userid:user})
                console.log(del)
                const addone = new news.user({'userid':rec.userid,'email':rec.email,'password':rec.password})
                await addone.save()
            }
            catch(e){
                console.log(e.message)
            }
        }
        res.render("home")
    }
})

app.post("/createnews/:id",async(req,res)=>{

    
    if(req.params.id == 'insert')
    {
        res.render('dataentered',{'val':"Inserted"})
    }

    if(req.params.id == 'api')
    {
    try{
    
    const src = req.body.srcinput
    const srcadd = JSON.parse(src)

      const art = req.body.artinput
      const artadd = JSON.parse(art)
      

      const srcdup = news.source.findOne(srcadd,(err,result)=>{
        if(err) res.send(err)
        if(result){
            console.log("Data Already Present")
        }
        else{
            const addsrc = new news.source(srcadd)
            addsrc.save()
            console.log("Data Successfully Entered")
        }
      })

      const artdup = news.article.findOne(artadd,(err,result)=>{
        if(err) res.send(err)
        if(result){
            console.log("Data Already Present")
        }
        else{
            const addarticle = new news.article(artadd)
            addarticle.save()
            console.log("Data Successfully Entered")
        }
      })
      res.render("dataentered")

      //Add Many Entries
    //   const add = {
    //    id: 101,
    //     name: "Abhishek"
    //   }
    //   const add2 = {
    //     id: 102,
    //     name: "Nayak"
    //   }
    //   let arr = []
    //   arr.push(add);
    //   arr.push(add2);
    //   news.user.insertMany(arr);
    //   console.log(arr);
    }
    catch(err){
        res.send(err.message)
    }
}
})

app.get("/signup",(req,res)=>{
    res.render("signup");
})

app.get("/update/:id",async(req,res)=>{

    const data = await news.article.findOne({'_id':req.params.id})

    // console.log(data)

    res.render("update.hbs",{'id':req.params.id,'update':true,'data':data})
})

app.post("/update/:id",async(req,res)=>{

    const data = await news.article.findOne({'id':req.params.id})
    const newdata = {}
    const src = {}

    if(data.source){
        if(data.source.id != req.body.sid){
            src.id = req.body.sid
        }
        if(data.source.name != req.body.sname){
            src.name = req.body.sname
        }
        newdata.source = src
    }

    if(!data.source){
        if(req.body.sid) src.id = req.body.sid
        if(req.body.sname) src.name = req.body.sname
        newdata.source = src
    }

    if(data.title!=req.body.title){
        newdata.title = req.body.title
    }
    if(data.description != req.body.desc){
        newdata.description = req.body.desc
    }
    if(data.url != req.body.url){
        newdata.url = req.body.url
    }
    if(data.urlToImg != req.body.urltoimg){
        newdata.urlToImg = req.body.urltoimg
    }
    if(data.publishedAt != req.body.pubat){
        newdata.publishedAt = req.body.pubat
    }
    if(data.content != req.body.content){
        newdata.content = req.body.content
    }

    console.log(newdata)

    try{
    const updata = await news.article.updateOne({_id:req.params.id},{$set : newdata});

    console.log(updata)
    res.render('dataentered',{'val':"Updated"})
    }
    catch(err){
        console.log(err.message)
    }
    
})

app.post("/delete/:id/:yn",async(req,res)=>{

    if(req.params.yn==null){
        res.render("delete.hbs",{'id':req.params.id})
    }
    if(req.params.yn == 'yes'){

        const deldata = await news.article.deleteOne({'_id':req.params.id})
        console.log(deldata)
        res.render('dataentered',{'val':"Deleted"})
    }
    if(req.params.yn == 'no'){
        console.log("Record not deleted")
        res.send('Record Not Deleted')
    }
});

app.get("/delete/:id",(req,res)=>{
    res.render("delete.hbs",{'id':req.params.id})
});

app.get("/about",(req,res)=>{
    res.send("This is the about page");
})

app.get("*",(req,res)=>{
    res.status(404).render("Error")
})

app.listen(port, ()=>{
    console.log("Running at http://localhost:"+port);
})  

