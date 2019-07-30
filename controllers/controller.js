const express = require("express");
const router = express.Router();
const path = require("path");

const request = require("request");
const cheerio = require("cheerio");

const Comment = require("../models/Comments.js");

const Article = require('../models/Article.js');

router.get("/", (req, res) => {
    res.redirect("/articles");
});

router.get("/scrape", function (req, res) {
    request("https://intothegloss.com/", function (err, res, html) {
        let $ = cheerio.load(html);
        let titlesArray = [];

        $("m-posts-item-intro").each(function (i, element) {
            let result = {};

            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");

            if (result.title !== "" && result.link !== "") {
                if (titlesArray.indexOf(result.title) == -1) {
                    titlesArray.push(result.title);

                    Article.count({ title: result.title }, function (err, test) {
                        if (test === 0) {
                            let entry = new Article(result);

                            entry.save(function (err, doc) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(doc);
                                }
                            });
                        }
                    });
                } else {
                    console.log("Article already exists.");
                }
            } else {
                console.log("Not saved to DB, missing data");
            }
        });
        res.redirect("/");
    });
});
router.get("/articles", function (req, res) {
    Article.find()
        .sort({ _id: -1 })
        .exec(function (err, doc) {
            if (err) {
                console.log(err);
            } else {
                var artcl = { article: doc };
                res.render("index", artcl);
            }
        });
});

router.get("/articles-json", function (req, res) {
    Article.find({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.json(doc);
        }
    });
});

router.get("/clearAll", function (req, res) {
    Article.remove({}, function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log("removed all articles");
        }
    });
    res.redirect("/articles-json");
});

router.get("/readArticle/:id", function (req, res) {
    let articleId = req.params.id;
    let hbsObj = {
        article: [],
        body: []
    };

    Article.findOne({ _id: articleId })
        .populate("comment")
        .exec(function (err, doc) {
            if (err) {
                console.log(`Error:${err}`);
            } else {
                hbsObj.article = doc;
                let link = doc.link;
                request(link, function (error, response, html) {
                    var $ = cheerio.load(html);

                    $("c-h2-m-posts-item-title").each(function (i, element) {
                        hbsObj.body = $(this)
                            .children(".c-entry-content")
                            .children("p")
                            .text();

                        res.render("article", hbsObj);
                        return false;
                    });
                });
            }
        });
});
router.post("/comment/:id", function (req, res) {
    var user = req.body.name;
    var content = req.body.comment;
    var articleId = req.params.id;

    var commentObj = {
        name: user,
        body: content
    };

    var newComment = new Comment(commentObj);

    newComment.save(function (err, doc) {
        if (err) {
            console.log(err);
        } else {
            console.log(doc._id);
            console.log(articleId);

            Article.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { comment: doc._id } },
                { new: true }
            ).exec(function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/readArticle/" + articleId);
                }
            });
        }
    });
});

module.exports = router;