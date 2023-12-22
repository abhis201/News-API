const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs');
require(path.join(__dirname, "db/conn"));
const news = require(path.join(__dirname, "/models/collections"));
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const auth = require(path.join(__dirname, '/middleware/auth'))
const methodOverride = require('method-override')
const jwt = require("jsonwebtoken")
const axios = require('axios')
require("dotenv").config()

const port = process.env.PORT || 3000;

const static = path.join(__dirname, "static");
const bootcss = path.join(__dirname, "/node_modules/bootstrap/dist/css");
const bootjs = path.join(__dirname, "/node_modules/bootstrap/dist/js");
const jq = path.join(__dirname, "/node_modules/jquery/dist");

app.use("/css", express.static(bootcss));
app.use("/js", express.static(bootjs));
app.use("/jq", express.static(jq));

app.use(express.static(static));

const partials = path.join(__dirname, "/views/partials");
app.set('view engine', 'hbs');
hbs.registerPartials(partials);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

function getUsernameFromToken(req) {
    const jwtCookie = req.cookies.jwt;
    let username = null;

    if (jwtCookie) {
        try {
            const decodedPayload = jwt.verify(jwtCookie, process.env.SECRET_KEY);
            username = decodedPayload.userid;
            console.log("Cookie Token: " + jwtCookie);
        } catch (error) {
            // Handle token verification errors if needed
            console.error("Token verification failed:", error.message);
        }
    }

    return username;
}

async function fetchData(req, res) {
    let user = news.user;
    let article = news.article;

    let username = getUsernameFromToken(req)
    let cur_user = await user.findOne({ 'userid': username })
    let source = await article.distinct('source.name');

    let email = null
    if (cur_user) {
        email = cur_user.email
        console.log("User Email: " + email)
    }

    let u = await user.find();
    let a = await article.find();

    const cu = u.length;
    const ca = a.length;
    const cs = source.length;

    let count = { 'srcnum': cs, 'artnum': ca, 'usnum': cu };

    let card = null;

    // Assuming news is properly defined in your code
    if (req.query.search) {
        const regex = new RegExp(".*" + req.query.search + ".*", 'i');

        card = await news.article.find({ $or: [{ title: { $regex: regex } }, { description: { $regex: regex } }, { content: { $regex: regex } }] });
    } else {
        card = a
    }
    let pass = { 'user': username, 'user_email': email, 'articles': card, 'count': count };

    category_news = null//logic for category news
    return pass;
}

app.get('/fetchArticles', async (req, res) => {
    try {
        var url = 'http://newsapi.org/v2/top-headlines?' +
            'country=in&' +
            'apiKey=36f3e29b704f41339af8439dc1228334';

        const news_get = await axios.get(url)
        res.send(news_get.data)

    } catch (error) {
        if (error.response) {
            console.log(error)
        }
    }
})

app.get("", async (req, res) => {

    const pass = await fetchData(req, res)
    res.render("home", pass);
})

let ctr;
let category_news;

app.get("/category/:category", async (req, res) => {
    try {
        var category = req.params.category;
        let user = news.user;
        let article = news.article;

        let ctry;
        if (req.query.country) {
            ctry = req.query.country
            ctr = ctry
        }

        if (!ctry)
            ctry = ctr || "us"

        let username = getUsernameFromToken(req)
        let cur_user = await user.findOne({ 'userid': username })
        let source = await article.distinct('source.name');

        let email = null
        if (cur_user) {
            email = cur_user.email
            console.log("User Email: " + email)
        }

        let u = await user.find();
        let a = await article.find();

        const cu = u.length;
        const ca = a.length;
        const cs = source.length;

        let count = { 'srcnum': cs, 'artnum': ca, 'usnum': cu };

        let filteredArticles;
        if (!req.query.search) {
            const url = `http://newsapi.org/v2/top-headlines?country=${ctry}&category=${category}&apiKey=36f3e29b704f41339af8439dc1228334`;

            const news_get = await axios.get(url);
            filteredArticles = news_get.data.articles.filter(art => art.urlToImage !== null);

            category_news = filteredArticles
        }
        if (req.query.search) {
            filteredArticles = category_news
            const regex = new RegExp(".*" + req.query.search + ".*", 'i');

            // Assuming filteredArticles is an array of articles
            const card = filteredArticles.filter(article => {
                const titleMatch = article.title && article.title.match(regex);
                const descriptionMatch = article.description && article.description.match(regex);
                const contentMatch = article.content && article.content.match(regex);

                return titleMatch || descriptionMatch || contentMatch;
            });

            let pass = { 'user': username, 'user_email': email, 'articles': card, 'count': count };
            res.render("category", pass);
        } else {
            // If no search query, use all articles
            let pass = { 'user': username, 'user_email': email, 'articles': filteredArticles, 'count': count };
            res.render("category", pass);
        }
    } catch (error) {
        if (error.response) {
            console.log(error);
        }
        // Handle error appropriately
        console.log(error)
        res.status(500).send("Internal Server Error - " + error);
    }
});


app.get("/createnews", auth, (req, res) => {
    res.render("createnews", { 'insert': true, 'user': getUsernameFromToken(req) })
})

app.post("/logout", async (req, res) => {
    console.log("Clearing Cookies")
    res.clearCookie('jwt');
    res.redirect('/');
})

app.post("/fetch", async (req, res) => {
    try {
        const country = req.body.country;
        const user = getUsernameFromToken(req)
        if (user) {
            var url = 'http://newsapi.org/v2/top-headlines?' +
                'country=' + country + '&' +
                'apiKey=36f3e29b704f41339af8439dc1228334';

            const news_get = await axios.get(url)
            console.log(news_get.data)

            const user_data = news.user.findOne({ 'userid': user })
            const articlesToSave = news_get.data.articles.filter(art => art.urlToImage !== null).map(newsArticle => {
                return {
                    source: {
                        id: newsArticle.source.id || null,
                        name: newsArticle.source.name || null
                    },
                    user: user_data._id,
                    title: newsArticle.title || null,
                    description: newsArticle.description || null,
                    url: newsArticle.url || null,
                    urlToImage: newsArticle.urlToImage || null,
                    publishedAt: newsArticle.publishedAt || null,
                    content: newsArticle.content || null
                };
            });
            await news.article.insertMany(articlesToSave)
                .then(result => {
                    console.log('Articles saved successfully:', result);
                })
                .catch(error => {
                    console.error('Error saving articles:', error);
                });
            res.status(201).redirect("/")
        }
        else {
            res.send("Please login to fetch articles!")
        }
    } catch (error) {
        if (error.response) {
            console.log(error)
        }
    }
})

app.post("/signup", async (req, res) => {
    try {
        const { userid, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await news.user.findOne({ $or: [{ userid: userid }, { email: email }] });

        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        // Create a new user with the hashed password
        const newUser = new news.user({
            userid: userid,
            email: email,
            password: password,
        });

        // Save the new user to the database
        const userdata = await newUser.save();

        const token = await userdata.generateAuthToken();
        console.log(token)
        await userdata.save()

        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 60 * 60 * 1000),
            httpOnly: true
        })

        res.status(201).redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/login", async (req, res) => {
    try {
        const userid = req.body.userid;
        const pass = req.body.pass;
        const userdata = await news.user.findOne({ userid: userid })

        if (userdata) {
            const matchpass = await bcrypt.compare(pass.trim(), userdata.password.trim())
            if (matchpass) {
                res.cookie('jwt', userdata.token, {
                    expires: new Date(Date.now() + 60 * 60 * 1000),
                    httpOnly: true
                })
                res.status(200).redirect("/")
            }
            else {
                res.status(401).send("Wrong Password");
            }
        }
        else {
            res.status(401).send("Invalid Credentials");
        }
    }
    catch (error) {
        console.log(error)
        res.status(401).send("Invalid Login Detail")
    }
})

app.post("", async (req, res) => {

    const { userID, emailID, review } = req.body;

    const newReview = new news.review({
        userid: userID,
        email: emailID,
        review: review
    })

    await newReview.save()

    res.status(201).redirect('/');
})

app.post("/deleteAll", async (req, res) => {
    try {
        const deletionResult = await news.article.deleteMany();
        console.log(`Deleted ${deletionResult.deletedCount} news articles.`);
        res.redirect("/");
    } catch (error) {
        console.error("Error deleting news articles:", error);
        res.status(500).send("Internal Server Error");
    }

})

app.post("/:id", async (req, res) => {
    if (req.params.id == 'article') {
        const arcs = await news.article.find().distinct('title')
        console.log(arcs.count + " distinct articles")

        for (let arc of arcs) {
            try {
                const rec = await news.article.findOne({ title: arc })
                const del = await news.article.deleteMany({ title: arc })
                const addone = new news.article({ 'title': rec.title, 'description': rec.description, 'url': rec.url, 'urlToImage': rec.urlToImage, 'publishedAt': rec.publishedAt, 'content': rec.content })
                await addone.save()
            }
            catch (e) {
                console.log(e.message)
            }
        }
        res.redirect("/")
    }
    else if (req.params.id == 'source') {
        const srcs = await news.source.find().distinct('id')
        console.log(srcs)

        for (let src of srcs) {
            try {
                const rec = await news.source.findOne({ id: src })
                const del = await news.source.deleteMany({ id: src })
                const addone = new news.source({ 'id': rec.id, 'name': rec.name })
                await addone.save()
            }
            catch (e) {
                console.log(e.message)
            }
        }
        res.redirect("/")
    }
    else if (req.params.id == 'user') {
        const users = await news.user.find().distinct('userid')

        for (let user of users) {
            try {
                const rec = await news.user.findOne({ userid: user })
                const del = await news.user.deleteMany({ userid: user })
                const addone = new news.user({ 'userid': rec.userid, 'email': rec.email, 'password': rec.password })
                await addone.save()
            }
            catch (e) {
                console.log(e.message)
            }
        }
        res.redirect("/")
    }
})

app.post("/createnews/:id", async (req, res) => {

    try {
        const art = req.body.artinput
        const artadd = JSON.parse(art)

        const artdup = news.article.findOne(artadd, (err, result) => {
            if (err) res.send(err)
            if (result) {
                console.log("Data Already Present")
            }
            else {
                const addarticle = new news.article(artadd)
                addarticle.save()
                console.log("Data Successfully Entered")
            }
        })
        alert("Data Successfully Added!")
        res.status(201).redirect("/")
    }
    catch (err) {
        res.send(err.message)
    }
})

app.get("/signup", (req, res) => {
    res.render("signup");
})

app.get("/update/:id", async (req, res) => {

    const data = await news.article.findOne({ '_id': req.params.id })

    // console.log(data)

    res.render("update.hbs", { 'id': req.params.id, 'update': true, 'data': data })
})

app.post("/update/:id", async (req, res) => {

    const data = await news.article.findOne({ 'id': req.params.id })
    const newdata = {}
    const src = {}

    if (data.source) {
        if (data.source.id != req.body.sid) {
            src.id = req.body.sid
        }
        if (data.source.name != req.body.sname) {
            src.name = req.body.sname
        }
        newdata.source = src
    }

    if (!data.source) {
        if (req.body.sid) src.id = req.body.sid
        if (req.body.sname) src.name = req.body.sname
        newdata.source = src
    }

    if (data.title != req.body.title) {
        newdata.title = req.body.title
    }
    if (data.description != req.body.desc) {
        newdata.description = req.body.desc
    }
    if (data.url != req.body.url) {
        newdata.url = req.body.url
    }
    if (data.urlToImg != req.body.urltoimg) {
        newdata.urlToImg = req.body.urltoimg
    }
    if (data.publishedAt != req.body.pubat) {
        newdata.publishedAt = req.body.pubat
    }
    if (data.content != req.body.content) {
        newdata.content = req.body.content
    }

    console.log(newdata)

    try {
        const updata = await news.article.updateOne({ _id: req.params.id }, { $set: newdata });

        console.log(updata)
        res.render('dataentered', { 'val': "Updated" })
    }
    catch (err) {
        console.log(err.message)
    }

})

app.post("/delete/:id/:yn", async (req, res) => {

    if (req.params.yn == null) {
        res.render("delete.hbs", { 'id': req.params.id })
    }
    if (req.params.yn == 'yes') {

        const deldata = await news.article.deleteOne({ '_id': req.params.id })
        console.log(deldata)
        res.render('dataentered', { 'val': "Deleted" })
    }
    if (req.params.yn == 'no') {
        console.log("Record not deleted")
        res.send('Record Not Deleted')
    }
});

app.get("/delete/:id", (req, res) => {
    res.render("delete.hbs", { 'id': req.params.id })
});

app.get("/about", (req, res) => {
    res.send("This is the about page");
})

app.get("*", (req, res) => {
    res.status(404).render("Error")
})

app.listen(port, () => {
    console.log(`Running at http://localhost:${port}\nPlease wait for the database to connect...`);
})

