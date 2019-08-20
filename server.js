
const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");

const axios = require("axios");
const cheerio = require("cheerio");

const db = require("./models");

const PORT = process.env.PORT || 3000;

const app = express();

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(logger("dev"));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(express.static("public"));

// Connect to MongoDB - if deployed then use monolab - else use local db
//const MONGODB_URI = process.env.MONGO_URI || "mongodb://localhost/scraper_news";
const MONGODB_URI = process.env.MONGO_URI || "mongodb://heroku_440bnzt4:h0oskes5qdq26vgo4tkt0f7fhs@ds239936.mlab.com:39936/heroku_440bnzt4";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes


app.get("/scrape", function (req, res) {

    axios.get("http://www.buzzfeed.com/").then(function (response) {
        const $ = cheerio.load(response.data);
        $(".story-card").each(function (i, element) {

            var result = {};

            result.title = $(this).find("h2").text();
            result.summary = $(this).find("p").text();
            result.link = $(this).find("a").attr("href");

            db.Article.find({ title: result.title }).then(function (data) {
                if (result.link && result.summary && !data.length) {


                    db.Article.create(result).then(function (dbArticle) {

                        console.log(dbArticle);

                    })
                        .catch(err => console.log(err));
                }
            });
        });

        res.send("Scrape Complete");
    });
});

// GET route  
app.get("/", function (req, res) {
    db.Article.find({ saved: false }).then(function (articles) {
        res.render("index", { articles });
    });
});

// PUT route 
app.put("/saveArticle/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: true }).then(function (data) {
        console.log(data);
        res.send("Saved article.");
    });
});

// GET route  
app.get("/savedArticles", function (req, res) {
    db.Article.find({ saved: true }).then(function (articles) {
        res.render("saved", { articles });
    });
});

// DELETE route  
app.delete("/delete", function (req, res) {
    db.Article.deleteMany({}).then(function (data) {
        console.log(data);
        res.render("index", data);
    });
});

// PUT route  
app.put("/removeFromSaved/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { saved: false }).then(function (data) {
        res.send("Removed");
    });
});

// POST route  
app.post("/saveNote/:id", function (req, res) {
    db.Note.create(req.body).then(function (dbNote) {
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
    }).then(function (dbArticle) {
        res.json(dbArticle);
    }).catch(function (err) {
        res.json(err);
    });
});

// GET route  
app.get("/getNotes/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id }).populate("notes")
        .then(function (dbArticle) {
            res.json(dbArticle);
        }).catch(function (err) {
            res.json(err);
        });
});

// DELETE route  
app.delete("/deleteNote/:noteid", function (req, res) {
    db.Note.deleteOne({ _id: req.params.noteid }).then(function (data) {
        console.log(data);
        res.send("Deleted");
    })
});

// Start the server
app.listen(PORT, function () {
    console.log("Server listening on: http://localhost:" + PORT);
});